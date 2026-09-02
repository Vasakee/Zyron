import { forwardRef, Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { StripePayInvoice } from './stripe/pay-invoice';
import { PaymentGateway } from '../payment-gateway.interface';

@Injectable()
export class PayInvoiceService {
  constructor(
    @Inject(forwardRef(() => 'PaymentGateway'))
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(
    invoiceId: string,
    params?: Stripe.InvoicePayParams,
    opts?: { idempotencyKey?: string },
  ): Promise<Stripe.Response<Stripe.Invoice>> {
    return this.paymentGateway.payInvoice(invoiceId, params, opts);
  }
}
