import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { STRIPE_API_KEY } from 'src/config';

type UpsertOpts = {
  idempotencyKey?: string;
  metadata?: Record<string, string>;
  updateNameIfDifferent?: boolean;
};

@Injectable()
export class StripeGetOrCreateCustomerByEmail {
  private readonly logger = new Logger(StripeGetOrCreateCustomerByEmail.name);
  private stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2024-06-20' });

  async execute(
    emailRaw: string,
    name?: string,
    opts: UpsertOpts = {},
  ): Promise<Stripe.Customer> {
    const email = (emailRaw || '').trim().toLowerCase();
    if (!email) {
      throw new Error('Email is required to get or create a Stripe customer');
    }

    const search = await this.stripe.customers.search({
      query: `email:"${email}"`,
      limit: 1,
    });
    const found = search.data?.[0];

    if (found) {
      this.logger.log(
        `Found existing Stripe customer ${found.id} for ${email}`,
      );
      return found;
    }

    const created = await this.stripe.customers.create(
      {
        email,
        name: name?.trim() || undefined,
        metadata: opts.metadata ?? {},
      },
      opts.idempotencyKey
        ? { idempotencyKey: `cust:create:${email}:${opts.idempotencyKey}` }
        : undefined,
    );

    this.logger.log(`Created Stripe customer ${created.id} for ${email}`);
    return created;
  }
}
