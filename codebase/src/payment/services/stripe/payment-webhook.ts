import Stripe from 'stripe';
import { STRIPE_API_KEY, STRIPE_WEBHOOK_HASH } from 'src/config';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StripeCancelledTransactionService } from './cancelled-transactions';
import { InvoicePaymentSucceededService } from './invoice-payment-succeeded.service';
import { InvoicePaymentFailedService } from './invoice-payment-failed.service';
// import { StripePaymentReceiptService } from './payment-receipt';
import { Session } from './types/session';
import { StripeInvoiceFinalizationFailedService } from './invoice-finalization-failed.service';
import { StripeCheckoutSessionCompletedService } from './checkout-session-completed.service';

@Injectable()
export class StripePaymentWebhook {
  private stripe: Stripe;
  private readonly apiKey = STRIPE_API_KEY;

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
    private readonly stripeCancelledTransactionService: StripeCancelledTransactionService,
    private readonly invoicePaymentSucceededService: InvoicePaymentSucceededService,
    private readonly invoicePaymentFailedService: InvoicePaymentFailedService,
    private readonly invoiceFinalizationFailedService: StripeInvoiceFinalizationFailedService,
    // private readonly stripePaymentReceiptService: StripePaymentReceiptService,
    private readonly checkoutSessionCompletedService: StripeCheckoutSessionCompletedService,
  ) {
    this.stripe = new Stripe(this.apiKey, { apiVersion: '2024-06-20' });
  }

  async execute(data: any, signature: string) {
    try {
      const session = await this.dataSource.transaction(async (manager) => {
        const payload = JSON.stringify(data);

        // Verify the webhook signature
        const header = this.stripe.webhooks.generateTestHeaderString({
          payload,
          secret: STRIPE_WEBHOOK_HASH,
        });
        const event: Stripe.Event = this.stripe.webhooks.constructEvent(
          payload,
          header,
          STRIPE_WEBHOOK_HASH,
        ) as Stripe.Event;

        const object = event.data.object as Session;

        switch (event.type) {
          case 'checkout.session.completed':
            await this.handleCheckoutSessionCompleted(object, manager);
            break;

          case 'payment_intent.canceled':
            await this.handlePaymentIntentCanceled(
              object.payment_intent as Stripe.PaymentIntent,
            );
            break;

          case 'invoice.payment_succeeded':
            await this.handleInvoicePaymentSucceeded(
              event.data.object as Stripe.Invoice,
            );
            break;

          case 'invoice.finalization_failed':
            await this.handleInvoiceFinalizationFailed(
              event.data.object as Stripe.Invoice,
            );
            break;

          case 'invoice.payment_failed':
            await this.handleInvoicePaymentFailed(
              event.data.object as Stripe.Invoice,
            );
            break;

          default:
            console.log(`Unhandled event type: ${event.type}`);
        }
      });
      return session;
    } catch (error) {
      console.error('Stripe webhook error:', error.message);
      throw error;
    }
  }

  private async handleCheckoutSessionCompleted(session: Session, manager: any) {
    await this.checkoutSessionCompletedService.execute(session, manager);
  }

  private async handlePaymentIntentCanceled(
    paymentIntent: Stripe.PaymentIntent,
  ) {
    await this.stripeCancelledTransactionService.execute(paymentIntent);
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    await this.invoicePaymentSucceededService.execute(invoice);
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    await this.invoicePaymentFailedService.execute(invoice);
  }

  private async handleInvoiceFinalizationFailed(invoice: Stripe.Invoice) {
    await this.invoiceFinalizationFailedService.execute(invoice);
  }
}
