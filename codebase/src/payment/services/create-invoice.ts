import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PaymentGateway } from '../payment-gateway.interface';
import { PaymentStatement } from '../entity/payment-statement.entity';
import Stripe from 'stripe';

@Injectable()
export class CreateInvoiceService {
  constructor(
    @Inject(forwardRef(() => 'PaymentGateway'))
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(
    primaryStatement: PaymentStatement,
    additionalStatements?: PaymentStatement[],
  ): Promise<Stripe.Response<Stripe.Invoice>> {
    try {
      return this.paymentGateway.createInvoice(
        primaryStatement,
        additionalStatements,
      );
    } catch (error) {
      throw error;
    }
  }
}
