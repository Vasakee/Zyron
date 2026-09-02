import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { STRIPE_API_KEY } from 'src/config';

@Injectable()
export class StripeRetrievePaymentMethodService {
  private readonly stripe = new Stripe(STRIPE_API_KEY, {
    apiVersion: '2024-06-20',
  });

  async execute(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    return await this.stripe.paymentMethods.retrieve(paymentMethodId);
  }
}