import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PaymentGateway } from '../payment-gateway.interface';
import Stripe from 'stripe';

@Injectable()
export class CreateInvoiceItemService {
  constructor(
    @Inject(forwardRef(() => 'PaymentGateway'))
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(
    userId: string,
    orderReferenceId: string,
    unit_amount: number,
    currency: string,
    kitType: string,
    quantity: number,
    country: string,
    description: string,
  ): Promise<Stripe.InvoiceItem> {
    try {
      return this.paymentGateway.createInvoiceItem(
        userId,
        orderReferenceId,
        unit_amount,
        currency,
        kitType,
        quantity,
        country,
        description,
      );
    } catch (error) {
      throw error;
    }
  }
}
