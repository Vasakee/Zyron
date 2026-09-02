import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { STRIPE_API_KEY } from 'src/config';

@Injectable()
export class StripeGetCheckoutSessions {
  private readonly stripe = new Stripe(STRIPE_API_KEY, {
    apiVersion: '2024-06-20',
  });

  async execute(): Promise<Stripe.Checkout.Session[]> {
    const sessions: Stripe.Checkout.Session[] = [];
    const iter = this.stripe.checkout.sessions.list({ limit: 100 });
    for await (const s of iter) {
      sessions.push(s);
    }
    return sessions;
  }
}
