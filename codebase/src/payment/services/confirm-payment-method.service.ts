import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import { PaymentMethod } from '../entity/payment-method.entity';
import {
  PaymentGateway as PaymentGatewayEnum,
  PaymentMethodType,
} from 'src/enum';
import { BadRequestErrorException } from 'src/common';
import { PaymentGateway } from '../payment-gateway.interface';
import { MAX_PAYMENT_METHODS } from 'src/config';
import { isCardExpired, parseCardMetadata } from 'src/common/utils';

@Injectable()
export class ConfirmPaymentMethodService {
  private readonly logger = new Logger(ConfirmPaymentMethodService.name);
  private readonly maxPaymentMethods = parseInt(MAX_PAYMENT_METHODS, 10) || 3;

  constructor(
    @Inject(forwardRef(() => 'PaymentGateway'))
    private readonly paymentGateway: PaymentGateway,
    private readonly dataSource: DataSource,
  ) {}

  async execute(
    userId: string,
    setupIntentId: string,
    setAsDefault?: boolean,
  ): Promise<{
    message: string;
    paymentMethod: {
      id: string;
      type: string;
      brand: string;
      last4: string;
      expMonth: number;
      expYear: number;
      isDefault: boolean;
    };
  }> {
    try {
      // Get setup intent and payment method from Stripe (do this outside transaction)
      const { setupIntent, paymentMethod } =
        await this.paymentGateway.confirmPaymentMethod(setupIntentId);

      return await this.dataSource.transaction(async (manager) => {
        // Get user from database
        const user = await manager.findOne(User, {
          where: { id: userId },
          select: ['id', 'stripeId'],
        });

        if (!user) {
          throw new BadRequestErrorException('User not found');
        }

        if (!user.stripeId) {
          throw new BadRequestErrorException(
            'User does not have a Stripe customer ID',
          );
        }

        // Validate setup intent status
        if (setupIntent.status !== 'succeeded') {
          throw new BadRequestErrorException(
            'Payment method setup is incomplete. Please try adding your card again.',
          );
        }

        // Validate payment method type
        if (paymentMethod.type !== PaymentMethodType.Card) {
          throw new BadRequestErrorException(
            'Only card payment methods are supported',
          );
        }

        // Check if payment method already exists for this user
        const existingPaymentMethod = await manager.findOne(PaymentMethod, {
          where: { userId: user.id, providerId: paymentMethod.id },
        });

        if (existingPaymentMethod) {
          throw new BadRequestErrorException(
            'This payment method is already saved',
          );
        }

        // Get all user payment methods to enforce limit
        let userPaymentMethods = await manager.find(PaymentMethod, {
          where: { userId: user.id },
          order: { createdAt: 'DESC' },
        });

        // Remove excess payment methods to maintain max limit (including the new one being added)
        if (userPaymentMethods.length >= this.maxPaymentMethods) {
          const excessMethods = userPaymentMethods.slice(
            this.maxPaymentMethods - 1,
          );
          for (const method of excessMethods) {
            // Detach from Stripe
            try {
              await this.paymentGateway.deletePaymentMethod(method.providerId);
            } catch (error) {
              this.logger.warn(
                `Failed to detach payment method ${method.providerId} from Stripe`,
                error,
              );
            }
            await manager.remove(PaymentMethod, method);
          }

          // Update the list after removals
          userPaymentMethods = userPaymentMethods.slice(
            0,
            this.maxPaymentMethods - 1,
          );
        }

        // Attach payment method to customer in Stripe (if not already attached)
        if (paymentMethod.customer !== user.stripeId) {
          await this.paymentGateway.attachPaymentMethod(
            paymentMethod.id,
            user.stripeId,
          );
        }

        // Determine if this card should be set as default
        let shouldSetAsDefault = setAsDefault ?? false;

        // If setAsDefault is not explicitly provided, auto-determine based on valid cards
        if (setAsDefault === undefined) {
          // Check if user has no cards or all cards are expired (use updated list after removals)
          const hasValidCard = userPaymentMethods.some((method) => {
            const metadata = parseCardMetadata(method.metadata);
            if (!metadata) return false;
            return !isCardExpired(metadata.exp_month, metadata.exp_year);
          });

          // Set as default if user has no valid cards
          shouldSetAsDefault = !hasValidCard;
        }

        // Update default payment method in Stripe if needed
        if (shouldSetAsDefault) {
          await this.paymentGateway.updateDefaultPaymentMethod(
            user,
            paymentMethod.id,
          );

          // Find current default payment method
          const currentDefaultMethod = await manager.findOne(PaymentMethod, {
            where: { userId: user.id, isDefault: true },
          });

          // Unset current default
          if (currentDefaultMethod) {
            await manager.update(
              PaymentMethod,
              { id: currentDefaultMethod.id },
              { isDefault: false },
            );
          }
        }

        // Save new payment method to database
        const newPaymentMethod = await manager.save(PaymentMethod, {
          userId: user.id,
          providerId: paymentMethod.id,
          provider: PaymentGatewayEnum.Stripe,
          type: paymentMethod.type,
          isDefault: shouldSetAsDefault,
          metadata: JSON.stringify({
            name: paymentMethod.billing_details.name || '',
            brand: paymentMethod.card.brand,
            last_four: paymentMethod.card.last4,
            exp_month: paymentMethod.card.exp_month,
            exp_year: paymentMethod.card.exp_year,
          }),
        });

        const message = shouldSetAsDefault
          ? 'Payment method saved and set as default successfully'
          : 'Payment method saved successfully';

        this.logger.log(
          `Payment method ${paymentMethod.id} saved${
            shouldSetAsDefault ? ' and set as default' : ''
          } for user ${userId}`,
        );

        return {
          message,
          paymentMethod: {
            id: newPaymentMethod.id,
            type: paymentMethod.type,
            brand: paymentMethod.card.brand,
            last4: paymentMethod.card.last4,
            expMonth: paymentMethod.card.exp_month,
            expYear: paymentMethod.card.exp_year,
            isDefault: shouldSetAsDefault,
          },
        };
      });
    } catch (error) {
      this.logger.error('Failed to confirm and save payment method', {
        error: error.message,
        userId,
        setupIntentId,
      });
      throw error;
    }
  }
}
