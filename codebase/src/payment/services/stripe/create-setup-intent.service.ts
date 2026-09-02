import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { SAVE_CARD_PAYMENT_METHOD_CONFIGURATION_ID, STRIPE_API_KEY } from 'src/config';

@Injectable()
export class StripeCreateSetupIntentService {
  private readonly logger = new Logger(StripeCreateSetupIntentService.name);
  private readonly stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(STRIPE_API_KEY, {
      apiVersion: '2024-06-20',
    });
  }

  async execute(customerId: string): Promise<{
    setupIntentId: string;
    clientSecret: string;
  }> {
    try {
      // Create setup intent
      const setupIntent = await this.stripe.setupIntents.create({
        customer: customerId,
        automatic_payment_methods: { enabled: true },
        payment_method_configuration: SAVE_CARD_PAYMENT_METHOD_CONFIGURATION_ID,
      });

      this.logger.log(
        `Setup intent created successfully for customer ${customerId}: ${setupIntent.id}`,
      );

      return {
        setupIntentId: setupIntent.id,
        clientSecret: setupIntent.client_secret,
      };
    } catch (error) {
      this.logger.error('Failed to create setup intent', {
        error: error.message,
        customerId,
      });
      throw error;
    }
  }
}
