import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { STRIPE_API_KEY } from 'src/config';

@Injectable()
export class StripeFinalizeInvoice {
  private readonly logger = new Logger(StripeFinalizeInvoice.name);
  private stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2024-06-20' });

  async execute(
    invoiceId: string,
    opts?: { idempotencyKey?: string },
  ): Promise<Stripe.Response<Stripe.Invoice>> {
    const res = await this.stripe.invoices.finalizeInvoice(
      invoiceId,
      undefined,
      opts?.idempotencyKey ? { idempotencyKey: `inv:${invoiceId}:finalize:${opts.idempotencyKey}` } : undefined,
    );
    this.logger.log(`Finalized invoice ${res.id} (status=${res.status})`);
    return res;
  }
}
