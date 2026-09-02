import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PaymentGateway } from '../payment-gateway.interface';
import Stripe from 'stripe';

@Injectable()
export class RetrievePriceService {
  constructor(
    @Inject(forwardRef(() => 'PaymentGateway'))
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(priceId: string): Promise<Stripe.Response<Stripe.Price>> {
    try {
      return this.paymentGateway.retrievePrice(priceId);
    } catch (error) {
      throw error;
    }
  }
}
