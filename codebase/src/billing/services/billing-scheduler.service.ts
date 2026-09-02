import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DateTime } from 'luxon';
import { MonthlyBillingService } from './monthly-billing.service';
import { PaymentRetryService } from './payment-retry.service';
import { PaymentStatement } from 'src/payment/entity/payment-statement.entity';
import { PaymentStatementStatus } from 'src/enum';
import { SYSTEM_TIME_ZONE } from 'src/config';
import { BILLING_PERIOD_START_DAY } from 'src/config/keys';

@Injectable()
export class BillingSchedulerService {
  private readonly logger = new Logger(BillingSchedulerService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly monthlyBillingService: MonthlyBillingService,
    private readonly paymentRetryService: PaymentRetryService,
  ) {}

  private estDay(): DateTime {
    return DateTime.now().setZone(SYSTEM_TIME_ZONE).startOf('day');
  }

  private async hasBacklogFor(estDay: DateTime): Promise<boolean> {
    const count = await this.dataSource
      .getRepository(PaymentStatement)
      .createQueryBuilder('ps')
      .where('ps.status = :status', { status: PaymentStatementStatus.Open })
      .andWhere('ps.periodEnd = :estDate', { estDate: estDay.toJSDate() })
      .getCount();
    return count > 0;
  }

  async execute(): Promise<void> {
    this.logger.log('BillingSchedulerService: execute called');

    const est = this.estDay();
    const dom = est.day;
    const billingDay = +BILLING_PERIOD_START_DAY - 1;
    const retryDay = +BILLING_PERIOD_START_DAY;

    this.logger.log(
      `Billing window check → dom=${dom}, billingDay=${billingDay}, retryDay=${retryDay}`,
    );

    if (dom === billingDay) {
      this.logger.log('Triggering monthly billing process');
      await this.monthlyBillingService.processBillingDay();
      return;
    }

    if (dom >= retryDay && dom <= retryDay + 2) {
      const previousBillingDay = est.set({ day: billingDay });

      if (await this.hasBacklogFor(previousBillingDay)) {
        this.logger.log(
          'Backlog detected → running monthly billing before retries',
        );
        await this.monthlyBillingService.processBillingDay();
      }

      this.logger.log('Triggering payment retry process');
      await this.paymentRetryService.processRetryDay();
      return;
    }

    this.logger.log('Outside billing/retry window → nothing to do.');
  }

  async triggerBilling(): Promise<void> {
    this.logger.log('Manual trigger: monthly billing');
    await this.monthlyBillingService.processBillingDay();
  }

  async triggerRetry(): Promise<void> {
    this.logger.log('Manual trigger: payment retry');
    await this.paymentRetryService.processRetryDay();
  }
}
