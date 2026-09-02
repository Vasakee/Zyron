import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PaymentGateway } from '../payment-gateway.interface';
import Stripe from 'stripe';

@Injectable()
export class FinalizeInvoiceService {
  constructor(
    @Inject(forwardRef(() => 'PaymentGateway'))
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(
    invoiceId: string,
    opts?: { idempotencyKey?: string },
  ): Promise<Stripe.Response<Stripe.Invoice>> {
    try {
      return this.paymentGateway.finalizeInvoice(invoiceId, opts);
    } catch (error) {
      throw error;
    }
  }
}
