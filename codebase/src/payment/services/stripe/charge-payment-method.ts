import Stripe from 'stripe';
import { STRIPE_API_KEY } from 'src/config';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  AllowedCountries,
  PaymentGateway,
  PaymentType,
  TransactionStatus,
  SessionStatus,
  KitType,
} from 'src/enum';
import { User } from 'src/user/entity/user.entity';
import { Transaction } from 'src/payment/entity/transaction.entity';
import { PaymentMethod } from 'src/payment/entity/payment-method.entity';
import { BadRequestErrorException, NotFoundErrorException } from 'src/common';
import { StripePaymentReceiptService } from './payment-receipt';
import { Order } from 'src/order/entity/order.entity';
import { isCardExpired, parseCardMetadata } from 'src/common/utils';
import { StripePriceService } from '../stripe-price.service';
import { Currency, OrderPaymentType } from 'src/enum';

@Injectable()
export class StripeChargePaymentMethod {
  private stripe: Stripe;
  private readonly apiKey = STRIPE_API_KEY;

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly stripePaymentReceiptService: StripePaymentReceiptService,
    private readonly stripePriceService: StripePriceService,
  ) {
    this.stripe = new Stripe(this.apiKey, { apiVersion: '2024-06-20' });
  }

  async execute(
    firstName: string,
    lastName: string,
    userId: string,
    kitType: KitType,
    paymentMethodId: string,
    country: string,
    quantity: number,
    referenceId?: string,
    isPreOrder?: boolean,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const payment = await this.dataSource.transaction(async (manager) => {
        const [user, paymentMethod] = await Promise.all([
          manager.findOne(User, {
            where: { id: userId },
          }),
          manager.findOne(PaymentMethod, {
            where: { providerId: paymentMethodId, userId },
          }),
        ]);

        if (!user) {
          throw new NotFoundErrorException('User not found');
        }

        if (!paymentMethod) {
          throw new NotFoundErrorException('Payment method is Invalid');
        }

        // Check if the card has expired
        const cardMetadata = parseCardMetadata(paymentMethod.metadata);
        if (cardMetadata) {
          if (isCardExpired(cardMetadata.exp_month, cardMetadata.exp_year)) {
            throw new BadRequestErrorException(
              'This payment method has expired. Please add a new payment method',
            );
          }
        }

        const customerId = user.stripeId;

        if (!customerId) {
          throw new BadRequestErrorException(
            'Card could not be charged, please add a new payment method',
          );
        }

        const currencyForPrice =
          country === AllowedCountries.CA ? Currency.CAD : Currency.USD;
        const { stripePriceId } =
          await this.stripePriceService.findActivePriceOrThrow(
            {
              kitType,
              paymentType: OrderPaymentType.PLATFORM_ORDER,
              currency: currencyForPrice.toUpperCase(),
            },
            { isPreOrder: !!isPreOrder },
          );

        const price = await this.stripe.prices.retrieve(stripePriceId);

        if (!price.unit_amount) {
          throw new Error('Invalid price ID. No amount found.');
        }

        const totalAmount = price.unit_amount * quantity;
        const currency = price.currency;

        // Prepare client information
        const clientName =
          `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A';
        const clientEmail = user.email || 'N/A';

        const paymentIntent = await this.stripe.paymentIntents.create(
          {
            amount: totalAmount,
            currency,
            customer: customerId,
            payment_method: paymentMethod.providerId,
            off_session: true,
            confirm: true,
            metadata: {
              clientName: clientName,
              clientEmail: clientEmail,
              userId: userId,
              kitType: kitType,
              quantity: quantity.toString(),
              country: country,
              referenceId,
            },
          },
          referenceId ? { idempotencyKey: `pi:${referenceId}` } : undefined,
        );

        const txUpdate = {
          userId,
          type: PaymentType.Pay,
          gateway: PaymentGateway.Stripe,
          status:
            paymentIntent.status === SessionStatus.Succeeded
              ? TransactionStatus.Successful
              : TransactionStatus.Failed,
          metadata: JSON.stringify({ currency }),
          amount: paymentIntent.amount,
          paymentIntentId: paymentIntent.id,
          paidAt: new Date(),
          stripeInvoiceId: paymentIntent.invoice?.toString(),
        };

        const transactionOps = async () => {
          if (referenceId) {
            const updateResult = await manager.update(
              Transaction,
              { referenceId },
              txUpdate,
            );
            if (updateResult.affected && updateResult.affected > 0) {
              return;
            }
          }

          await manager.save(Transaction, {
            referenceId: referenceId || paymentIntent.id,
            ...txUpdate,
          });
        };

        await Promise.all([
          transactionOps(),
          manager.update(PaymentMethod, { userId }, { isDefault: false }),
          manager.update(
            PaymentMethod,
            { providerId: paymentMethodId, userId },
            { isDefault: true },
          ),
        ]);

        if (paymentIntent.status === SessionStatus.Succeeded) {
          // Create a temporary order object to satisfy the receipt service
          const orderForReceipt = {} as Order;
          orderForReceipt.user = user;
          orderForReceipt.firstName = firstName;
          orderForReceipt.lastName = lastName;
          orderForReceipt.email = user.email;
          orderForReceipt.referenceId = referenceId || paymentIntent.id;
          orderForReceipt.quantity = quantity;
          orderForReceipt.kitType = kitType;
          orderForReceipt.amountSubtotal = totalAmount;
          orderForReceipt.amountTotal = totalAmount;
          orderForReceipt.promotionCode = undefined;

          await this.stripePaymentReceiptService.emitPaymentReceipt({
            order: orderForReceipt,
            session: undefined, // No session for off-session charges
            paymentIntent,
          });
        }

        return paymentIntent;
      });

      return payment;
    } catch (error) {
      console.error('Error processing payment with saved method:', error);
      throw error;
    }
  }
}
