import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PaymentGateway } from '../payment-gateway.interface';
import Stripe from 'stripe';

@Injectable()
export class RetrieveInvoiceService {
  constructor(
    @Inject(forwardRef(() => 'PaymentGateway'))
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(
    invoiceId: string,
    options?: Stripe.InvoiceRetrieveParams,
  ): Promise<Stripe.Response<Stripe.Invoice>> {
    try {
      return this.paymentGateway.retrieveInvoice(invoiceId, options);
    } catch (error) {
      throw error;
    }
  }
}
