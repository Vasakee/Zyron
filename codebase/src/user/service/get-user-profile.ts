import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThanOrEqual, Not, Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { CreateCustomerAccountDto } from '../dto/customer-account.dto';
import {
  findLatestKit,
  findLatestPractitionerKit,
} from 'src/common/utils/get-latest-kit';
import { PaymentStatement } from 'src/payment/entity/payment-statement.entity';
import { PaymentStatementItem } from 'src/payment/entity/payment-statement-item.entity';
import { PaymentMethod } from 'src/payment/entity/payment-method.entity';
import { PaymentStatementStatus } from 'src/enum';
import { getCurrencyTotalsForStatement } from 'src/common/utils/manage-currency';
import { PAYMENT_GRACE_PERIOD_DAYS, SYSTEM_TIME_ZONE } from 'src/config/keys';
import { DateTime } from 'luxon';

@Injectable()
export class GetUserProfileService {
  private readonly logger = new Logger(GetUserProfileService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(PaymentStatement)
    private readonly paymentStatementRepo: Repository<PaymentStatement>,
    @InjectRepository(PaymentStatementItem)
    private readonly paymentStatementItemRepo: Repository<PaymentStatementItem>,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepo: Repository<PaymentMethod>,
  ) {}

  private async getOldestUnpaidStatement(
    userId: string,
  ): Promise<PaymentStatement | null> {
    const now = new Date();
    return this.paymentStatementRepo.findOne({
      where: [
        {
          userId,
          status: PaymentStatementStatus.Open,
          invoiceId: Not(IsNull()),
          periodEnd: LessThanOrEqual(now),
        },
        {
          userId,
          status: PaymentStatementStatus.PaymentFailed,
          invoiceId: Not(IsNull()),
          periodEnd: LessThanOrEqual(now),
        },
      ],
      order: { periodEnd: 'ASC' },
    });
  }

  private async hasUnpaidStatements(userId: string): Promise<boolean> {
    const count = await this.paymentStatementRepo.count({
      where: {
        userId,
        status: Not(PaymentStatementStatus.Paid),
      },
    });
    return count > 0;
  }

  private async hasPaymentMethods(userId: string): Promise<boolean> {
    const paymentMethods = await this.paymentMethodRepo.find({
      where: { userId },
    });

    if (paymentMethods.length === 0) {
      return false;
    }

    // Check if at least one payment method is not expired
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed

    return paymentMethods.some((method) => {
      try {
        const metadata = JSON.parse(method.metadata);
        const expYear = metadata.exp_year;
        const expMonth = metadata.exp_month;

        // Card is valid if exp_year is greater than current year
        // OR exp_year equals current year and exp_month >= current month
        return (
          expYear > currentYear ||
          (expYear === currentYear && expMonth >= currentMonth)
        );
      } catch (error) {
        this.logger.error(
          `Failed to parse payment method metadata for method ${method.id}`,
          error,
        );
        return false;
      }
    });
  }

  private async calculateInvoiceInfo(
    oldestUnpaidStatement: PaymentStatement | null,
  ) {
    if (!oldestUnpaidStatement) {
      return {
        isDue: false,
        currencyTotals: [],
        status: null as string | null,
        daysOverdue: 0,
      };
    }

    const overdueAt = DateTime.fromJSDate(
      new Date(
        new Date(oldestUnpaidStatement.periodEnd).setDate(
          new Date(oldestUnpaidStatement.periodEnd).getDate() +
            +PAYMENT_GRACE_PERIOD_DAYS,
        ),
      ),
      { zone: SYSTEM_TIME_ZONE || 'America/New_York' },
    );
    const nowZ = DateTime.now().setZone(SYSTEM_TIME_ZONE || 'America/New_York');

    let status: 'pending' | 'overdue' = 'pending';
    let daysOverdue = 0;

    if (nowZ > overdueAt) {
      status = 'overdue';
      daysOverdue = Math.max(
        1,
        nowZ.startOf('day').diff(overdueAt.startOf('day'), 'days').days,
      );
    }

    const items = await this.paymentStatementItemRepo.find({
      where: { paymentStatementId: oldestUnpaidStatement.id },
    });
    const currencyTotals = await getCurrencyTotalsForStatement(items);

    return {
      isDue: true,
      currencyTotals,
      status,
      daysOverdue,
    };
  }

  async execute(id: string) {
    try {
      const user = await this.userRepo.findOne({
        where: { id },
        relations: [
          'admin',
          'kit',
          'practitioner',
          'practitioner.practitionerKit',
          'clientPractitioners',
          'clientExternalPractitioner',
          'paymentMethod',
        ],
      });

      const result = new CreateCustomerAccountDto().fromEntity(user);
      const oldestUnpaidStatement = await this.getOldestUnpaidStatement(id);
      const hasUnpaidStatements = await this.hasUnpaidStatements(id);
      const hasPaymentMethods = await this.hasPaymentMethods(id);
      const invoiceInfo = await this.calculateInvoiceInfo(
        oldestUnpaidStatement,
      );

      return {
        ...result,
        kit: findLatestKit(user.kit),
        practitionerKit:
          user.practitioner && user.practitioner.practitionerKit
            ? findLatestPractitionerKit(user.practitioner.practitionerKit)
            : null,
        hasUnpaidStatements,
        hasPaymentMethods,
        invoice: {
          isDue: invoiceInfo.isDue,
          currencyTotals: invoiceInfo.currencyTotals,
          status: invoiceInfo.status,
          daysOverdue: invoiceInfo.daysOverdue,
        },
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
