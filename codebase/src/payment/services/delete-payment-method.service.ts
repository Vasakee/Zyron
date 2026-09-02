import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { PaymentMethod } from '../entity/payment-method.entity';
import { PaymentStatement } from '../entity/payment-statement.entity';
import { PaymentStatementStatus } from 'src/enum';
import {
  BadRequestErrorException,
  NotFoundErrorException,
} from 'src/common/filters/error-exceptions';
import { PaymentGateway } from '../payment-gateway.interface';

@Injectable()
export class DeletePaymentMethodService {
  private readonly logger = new Logger(DeletePaymentMethodService.name);

  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(PaymentStatement)
    private readonly paymentStatementRepository: Repository<PaymentStatement>,
    @Inject(forwardRef(() => 'PaymentGateway'))
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(paymentMethodId: string, userId: string) {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { id: paymentMethodId, userId },
    });

    if (!paymentMethod) {
      throw new NotFoundErrorException(
        'Payment method not found or does not belong to this user',
      );
    }

    const unpaidStatements = await this.paymentStatementRepository.count({
      where: {
        userId,
        status: Not(PaymentStatementStatus.Paid),
      },
    });

    if (unpaidStatements > 0) {
      throw new BadRequestErrorException(
        `Cannot delete payment method. You have ${unpaidStatements} unpaid payment statement(s). Please pay all outstanding statements before deleting your payment method.`,
      );
    }

    try {
      await this.paymentGateway.deletePaymentMethod(paymentMethod.providerId);
      this.logger.log(
        `Payment method ${paymentMethodId} deleted from Stripe (providerId: ${paymentMethod.providerId})`,
      );
    } catch (error) {
      this.logger.warn(
        `Failed to delete payment method from Stripe, proceeding with database deletion`,
        {
          error: error.message,
          paymentMethodId,
          providerId: paymentMethod.providerId,
        },
      );
    }

    await this.paymentMethodRepository.remove(paymentMethod);

    this.logger.log(
      `Payment method ${paymentMethodId} deleted for user ${userId}`,
    );

    return {
      message: 'Payment method deleted successfully',
      deletedPaymentMethodId: paymentMethodId,
    };
  }
}
