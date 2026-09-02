import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { STRIPE_API_KEY } from 'src/config';
import { CancelledTransactionEvent } from 'src/helper/events/cancelled-transactions';
import { CancelledTransaction } from 'src/payment/entity/cancelled-transaction.entity';
import Stripe from 'stripe';
import { DataSource } from 'typeorm';

@Injectable()
export class StripeCancelledTransactionService {
  private readonly logger = new Logger(StripeCancelledTransactionService.name);
  private stripe: Stripe;
  private readonly apiKey = STRIPE_API_KEY;

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.stripe = new Stripe(this.apiKey, { apiVersion: '2024-06-20' });
  }

  async execute(paymentIntent: Stripe.PaymentIntent) {
    try {
      await this.dataSource.transaction(async (manager) => {
        if (!paymentIntent.customer) {
          return;
        }

        const customer: Stripe.Customer = (await this.stripe.customers.retrieve(
          paymentIntent.customer as string,
        )) as any;

        const canceledTransaction = await manager.findOne(
          CancelledTransaction,
          {
            where: { paymentIntentId: paymentIntent.id },
          },
        );

        if (canceledTransaction) {
          return;
        }

        const date = new Date();
        date.setDate(date.getDate() + 7);

        const code = await this.stripe.promotionCodes.create({
          coupon: 'CANCEL30',
          customer: paymentIntent.customer as string,
          expires_at: Math.floor(date.getTime() / 1000), // Stripe expects timestamp in seconds
        });

        await manager.save(CancelledTransaction, {
          email: customer.email,
          paymentIntentId: paymentIntent.id,
        });

        const mailData: CancelledTransactionEvent = {
          name: customer?.name,
          code: code.code,
          email: customer.email,
        };

        this.eventEmitter.emit('cancelled.transaction', mailData);

        this.logger.log(`Sent to ${customer.email}`);

        return;
      });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
