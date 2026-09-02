import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PaymentMethod } from '../entity/payment-method.entity';
import { User } from 'src/user/entity/user.entity';
import {
  BadRequestErrorException,
  NotFoundErrorException,
} from 'src/common/filters/error-exceptions';
import { PaymentGateway } from '../payment-gateway.interface';

@Injectable()
export class UpdateDefaultPaymentMethodService {
  private readonly logger = new Logger(UpdateDefaultPaymentMethodService.name);

  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => 'PaymentGateway'))
    private readonly paymentGateway: PaymentGateway,
    private readonly dataSource: DataSource,
  ) {}

  async execute(paymentMethodId: string, userId: string) {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { id: paymentMethodId, userId },
      select: ['id', 'providerId', 'isDefault', 'type'],
    });

    if (!paymentMethod) {
      throw new NotFoundErrorException(
        'Payment method not found or does not belong to this user',
      );
    }

    if (paymentMethod.isDefault) {
      return {
        message: 'Payment method is already set as default',
        paymentMethodId,
      };
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'stripeId'],
    });

    if (!user) {
      throw new NotFoundErrorException('User not found');
    }

    return await this.dataSource.transaction(async (manager) => {
      try {
        await this.paymentGateway.updateDefaultPaymentMethod(
          user,
          paymentMethod.providerId,
        );

        this.logger.log(
          `Default payment method updated in provider for user ${userId}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to update default payment method in provider`,
          {
            error: error.message,
            paymentMethodId,
            userId,
          },
        );
        throw new BadRequestErrorException(
          'Failed to update default payment method. Please try again.',
        );
      }

      await manager.update(
        PaymentMethod,
        { userId, isDefault: true },
        { isDefault: false },
      );

      await manager.update(
        PaymentMethod,
        { id: paymentMethodId },
        { isDefault: true },
      );

      this.logger.log(
        `Default payment method updated locally for user ${userId} to ${paymentMethodId}`,
      );

      return {
        message: 'Default payment method updated successfully',
        paymentMethodId,
      };
    });
  }
}
