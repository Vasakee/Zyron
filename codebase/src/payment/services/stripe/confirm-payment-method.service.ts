import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { STRIPE_API_KEY } from 'src/config';

@Injectable()
export class StripeConfirmPaymentMethodService {
  private readonly logger = new Logger(StripeConfirmPaymentMethodService.name);
  private readonly stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(STRIPE_API_KEY, {
      apiVersion: '2024-06-20',
    });
  }

  async execute(setupIntentId: string): Promise<{
    setupIntent: Stripe.SetupIntent;
    paymentMethod: Stripe.PaymentMethod;
  }> {
    try {
      // Retrieve the setup intent
      const setupIntent = await this.stripe.setupIntents.retrieve(
        setupIntentId,
      );

      const paymentMethodId = setupIntent.payment_method as string;

      if (!paymentMethodId) {
        throw new Error('No payment method found in setup intent');
      }

      // Retrieve payment method details
      const paymentMethod = await this.stripe.paymentMethods.retrieve(
        paymentMethodId,
      );

      this.logger.log(
        `Retrieved setup intent ${setupIntentId} and payment method ${paymentMethodId}`,
      );

      return {
        setupIntent,
        paymentMethod,
      };
    } catch (error) {
      this.logger.error('Failed to confirm payment method in Stripe', {
        error: error.message,
        setupIntentId,
      });
      throw error;
    }
  }
}
