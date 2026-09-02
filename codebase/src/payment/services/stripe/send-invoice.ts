import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { STRIPE_API_KEY } from 'src/config';

@Injectable()
export class StripeSendInvoice {
  private readonly logger = new Logger(StripeSendInvoice.name);
  private stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2024-06-20' });

  async execute(
    invoiceId: string,
    opts?: { idempotencyKey?: string },
  ): Promise<Stripe.Response<Stripe.Invoice>> {
    const res = await this.stripe.invoices.sendInvoice(
      invoiceId,
      opts?.idempotencyKey
        ? { idempotencyKey: `inv:${invoiceId}:send:${opts.idempotencyKey}` }
        : undefined,
    );
    this.logger.log(`Sent invoice ${res.id} to customer ${res.customer}`);
    return res;
  }
}
