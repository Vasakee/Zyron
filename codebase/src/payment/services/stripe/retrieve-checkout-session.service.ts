import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { STRIPE_API_KEY } from 'src/config';

@Injectable()
export class StripeRetrieveCheckoutSessionService {
  private readonly stripe = new Stripe(STRIPE_API_KEY, {
    apiVersion: '2024-06-20',
  });

  async execute(
    sessionId: string,
    options?: { expand?: string[] }
  ): Promise<Stripe.Checkout.Session> {
    return await this.stripe.checkout.sessions.retrieve(sessionId, options);
  }
}