import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { STRIPE_API_KEY } from 'src/config';
import { AllowedCountriesAbbrev, CheckoutMode } from 'src/enum';

export type StripeCheckoutSessionParams = {
  priceId: string;
  mode: CheckoutMode;
  quantity: number;
  successUrl: string;
  cancelUrl: string;
  referenceId: string;
  metadata: Record<string, string>;
  customerId?: string;
  allowedCountries?: string[];
};

@Injectable()
export class StripeCreateCheckoutSessionService {
  private stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2024-06-20' });

  async execute(params: StripeCheckoutSessionParams): Promise<{
    id: string;
    url: string | null;
    raw: Stripe.Checkout.Session;
  }> {
    const session = await this.stripe.checkout.sessions.create(
      {
        mode: params.mode satisfies Stripe.Checkout.SessionCreateParams.Mode,
        line_items: [
          {
            price: params.priceId,
            quantity: params.quantity,
          },
        ],
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        ...(params.customerId ? { customer: params.customerId } : {}),
        shipping_address_collection: {
          allowed_countries:
            (params.allowedCountries as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[]) ?? [
              AllowedCountriesAbbrev.US,
              AllowedCountriesAbbrev.CA,
            ],
        },
        metadata: params.metadata,
        client_reference_id: params.referenceId,
      },
      params.referenceId
        ? { idempotencyKey: `cs:${params.referenceId}` }
        : undefined,
    );

    return { id: session.id, url: session.url, raw: session };
  }
}
