import Stripe from 'stripe';
import { PROMOTIONAL_CODE, STRIPE_API_KEY, WEBSITE_URL } from 'src/config';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Currency, KitType, PaymentGateway, PaymentType } from 'src/enum';
import { Transaction } from 'src/payment/entity/transaction.entity';
import { ShotgunWaitlist } from 'src/order/entity/shotgun-waitlist.entity';
import { getPriceId } from 'src/common/utils/manage-pricing';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class StripeProcessFirstWaitlistPayment {
  private stripe: Stripe;
  private readonly apiKey = STRIPE_API_KEY;

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    this.stripe = new Stripe(this.apiKey, { apiVersion: '2024-06-20' });
  }

  async execute(
    referenceId: string,
    currency: Currency,
    firstName: string,
    lastName: string,
    email: string,
    priceId?: string,
    quantity?: number,
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.dataSource.transaction(async (manager) => {
        const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

        const price = priceId ?? getPriceId(KitType.DeepGut, currency);
        quantity = quantity ?? 1;

        console.log('price', price);

        line_items.push({ price, quantity });

        const customer = await this.stripe.customers.create({
          name: `${firstName} ${lastName}`,
          email: email,
        });

        const customerId = customer.id;

        // Prepare client information
        const clientName =
          `${firstName || ''} ${lastName || ''}`.trim() || 'N/A';
        const clientEmail = email || 'N/A';

        const [session] = await Promise.all([
          this.stripe.checkout.sessions.create({
            success_url: `${WEBSITE_URL}/payment-success?status=success&session_id={CHECKOUT_SESSION_ID}`,
            line_items,
            mode: 'payment',
            customer: customerId,
            client_reference_id: referenceId,
            allow_promotion_codes:
              PROMOTIONAL_CODE === 'enabled' ? true : false,
            payment_intent_data: {
              setup_future_usage: 'off_session',
            },
            shipping_address_collection: {
              allowed_countries: [currency === Currency.CAD ? 'CA' : 'US'],
            },
            metadata: {
              clientName: clientName,
              clientEmail: clientEmail,
              referenceId: referenceId,
              currency: currency,
            },
          }),
          manager.save(Transaction, {
            referenceId,
            type: PaymentType.Pay,
            gateway: PaymentGateway.Stripe,
          }),
          manager.update(
            ShotgunWaitlist,
            { referenceId },
            { stripeCustomerId: customerId },
          ),
        ]);

        return session;
      });

      return session;
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }
}
