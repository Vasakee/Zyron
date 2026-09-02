import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { STRIPE_API_KEY } from 'src/config';

@Injectable()
export class StripeRetrievePrice {
  private stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2024-06-20' });

  async execute(priceId: string): Promise<Stripe.Response<Stripe.Price>> {
    return this.stripe.prices.retrieve(priceId);
  }
}
