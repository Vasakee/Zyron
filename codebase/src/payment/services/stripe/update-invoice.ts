import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { STRIPE_API_KEY } from 'src/config';

@Injectable()
export class StripeUpdateInvoice {
  private readonly logger = new Logger(StripeUpdateInvoice.name);
  private stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2024-06-20' });

  async execute(
    invoiceId: string,
    params: Stripe.InvoiceUpdateParams,
    opts?: { idempotencyKey?: string },
  ): Promise<Stripe.Response<Stripe.Invoice>> {
    const res = await this.stripe.invoices.update(
      invoiceId,
      params,
      opts?.idempotencyKey
        ? { idempotencyKey: `inv:${invoiceId}:update:${opts.idempotencyKey}` }
        : undefined,
    );
    this.logger.log(`Updated invoice ${res.id}`);
    return res;
  }
}
