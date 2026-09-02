import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Stripe from 'stripe';
import { Repository } from 'typeorm';
import { STRIPE_API_KEY } from 'src/config';
import { StripePrice } from '../entity/stripe-price.entity';

type SyncErrorHandler = (priceId: string, err: Error) => void | Promise<void>;

@Injectable()
export class StripeSyncPricesService {
  private readonly logger = new Logger(StripeSyncPricesService.name);
  private stripe: Stripe | null = null;

  constructor(
    @InjectRepository(StripePrice)
    private readonly stripePriceRepo: Repository<StripePrice>,
  ) {
    if (STRIPE_API_KEY) {
      this.stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2024-06-20' });
    }
  }

  async sync(
    priceIds?: string[],
    onError?: SyncErrorHandler,
  ): Promise<{ updated: number }> {
    if (!this.stripe) {
      this.logger.warn('Stripe API key not configured; skipping sync');
      return { updated: 0 };
    }

    const ids =
      priceIds && priceIds.length > 0
        ? [...new Set(priceIds.map((id) => id.trim()).filter(Boolean))]
        : (
            await this.stripePriceRepo.find({
              select: ['stripePriceId'],
            })
          )
            .map((p) => p.stripePriceId)
            .filter(Boolean);

    let updated = 0;
    for (const priceId of ids) {
      try {
        const price = await this.stripe.prices.retrieve(priceId);
        const amountMinor = price.unit_amount ?? 0;
        const mode = price.type === 'recurring' ? 'subscription' : 'payment';
        const interval = price.recurring?.interval ?? null;
        const stripeProductId =
          typeof price.product === 'string'
            ? price.product
            : price.product?.id ?? null;

        await this.stripePriceRepo.update(
          { stripePriceId: priceId },
          {
            amountMinor,
            mode,
            interval,
            stripeProductId,
          },
        );
        updated += 1;
      } catch (err) {
        const error = err as Error;
        if (onError) {
          await onError(priceId, error);
        } else {
          this.logger.error(`Failed to sync price ${priceId}`, {
            error: error.message,
          });
        }
      }
    }

    return { updated };
  }
}
