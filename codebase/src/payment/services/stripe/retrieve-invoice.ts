import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { STRIPE_API_KEY } from 'src/config';

@Injectable()
export class StripeRetrieveInvoice {
  private stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2024-06-20' });

  async execute(
    invoiceId: string,
    options?: Stripe.InvoiceRetrieveParams,
  ): Promise<Stripe.Response<Stripe.Invoice>> {
    return this.stripe.invoices.retrieve(invoiceId, options);
  }
}
