import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PaymentGateway } from '../payment-gateway.interface';
import Stripe from 'stripe';

@Injectable()
export class UpdateInvoiceService {
  constructor(
    @Inject(forwardRef(() => 'PaymentGateway'))
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(
    invoiceId: string,
    params: Stripe.InvoiceUpdateParams,
    opts?: { idempotencyKey?: string },
  ): Promise<Stripe.Response<Stripe.Invoice>> {
    try {
      return this.paymentGateway.updateInvoice(invoiceId, params, opts);
    } catch (error) {
      throw error;
    }
  }
}
