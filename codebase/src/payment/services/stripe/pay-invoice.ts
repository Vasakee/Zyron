import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { STRIPE_API_KEY } from 'src/config';

@Injectable()
export class StripePayInvoice {
  private stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2024-06-20' });

  async execute(
    invoiceId: string,
    params?: Stripe.InvoicePayParams,
    opts?: { idempotencyKey?: string },
  ): Promise<Stripe.Response<Stripe.Invoice>> {
    return this.stripe.invoices.pay(invoiceId, params, {
      idempotencyKey: opts?.idempotencyKey || undefined,
    });
  }
}
