import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import Stripe from 'stripe';
import { STRIPE_API_KEY } from 'src/config';
import { PaymentGateway, PaymentMethodType } from 'src/enum';
import { PaymentMethod } from 'src/payment/entity/payment-method.entity';
import { Order } from 'src/order/entity/order.entity';
import { Transaction } from 'src/payment/entity/transaction.entity';
import { BadRequestErrorException } from 'src/common';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class StripeSavePaymentMethodService {
  private readonly logger = new Logger(StripeSavePaymentMethodService.name);
  private stripe: Stripe;

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    this.stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2024-06-20' });
  }

  async execute(sessionId: string) {
    try {
      const result = await this.dataSource.transaction(async (manager) => {
        const session = await this.stripe.checkout.sessions.retrieve(
          sessionId,
          { expand: ['payment_intent'] },
        );

        if (!session || !session.payment_intent) {
          throw new BadRequestErrorException(
            'Invalid session or payment intent',
          );
        }

        const paymentIntent = session.payment_intent as Stripe.PaymentIntent;
        const paymentMethodId = paymentIntent.payment_method as string;

        if (!paymentMethodId) {
          throw new BadRequestErrorException('No payment method found');
        }

        const paymentMethod = await this.stripe.paymentMethods.retrieve(
          paymentMethodId,
        );

        if (paymentMethod.type !== PaymentMethodType.Card) {
          return { message: 'Payment method saved successfully' };
        }

        const referenceId = session.client_reference_id;

        const order = await manager.findOne(Order, {
          where: { referenceId },
          relations: ['user'],
        });

        if (!order) {
          throw new BadRequestErrorException('Order not found');
        }

        const transaction = await manager.findOne(Transaction, {
          where: { referenceId },
        });

        if (!transaction) {
          throw new BadRequestErrorException('Transaction not found');
        }

        const userPaymentMethods = await manager.find(PaymentMethod, {
          where: { userId: transaction.userId },
          order: { createdAt: 'DESC' },
        });

        const userPaymentMethodIds = userPaymentMethods.map(
          (eq) => eq.providerId,
        );

        if (!userPaymentMethodIds.includes(paymentMethod.id)) {
          if (userPaymentMethods.length > 2) {
            const excessMethods = userPaymentMethods.slice(2);
            for (const method of excessMethods) {
              await manager.remove(PaymentMethod, method);
            }
          }

          const currentDefaultMethod = await manager.findOne(PaymentMethod, {
            where: { userId: transaction.userId, isDefault: true },
          });

          if (currentDefaultMethod) {
            await manager.update(
              PaymentMethod,
              { id: currentDefaultMethod.id },
              { isDefault: false },
            );
          }

          await manager.save(PaymentMethod, {
            userId: transaction.userId,
            providerId: paymentMethod.id,
            provider: PaymentGateway.Stripe,
            type: paymentMethod.type,
            isDefault: true,
            metadata: JSON.stringify({
              name: paymentMethod.billing_details.name,
              brand: paymentMethod.card.brand,
              last_four: paymentMethod.card.last4,
              exp_month: paymentMethod.card.exp_month,
              exp_year: paymentMethod.card.exp_year,
            }),
          });

          await this.stripe.paymentMethods.attach(paymentMethod.id, {
            customer: order.user.stripeId,
          });
        }

        return { message: 'Payment method saved successfully' };
      });

      return result;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
