import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { STRIPE_API_KEY } from 'src/config';

@Injectable()
export class StripeAttachPaymentMethodService {
  private readonly stripe = new Stripe(STRIPE_API_KEY, {
    apiVersion: '2024-06-20',
  });

  async execute(
    paymentMethodId: string,
    customerId: string
  ): Promise<Stripe.PaymentMethod> {
    return await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  }
}