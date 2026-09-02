import { Injectable, Logger } from '@nestjs/common';
import { STRIPE_API_KEY } from 'src/config';
import Stripe from 'stripe';

@Injectable()
export class StripeUpdateDefaultPaymentMethodService {
  private readonly logger = new Logger(
    StripeUpdateDefaultPaymentMethodService.name,
  );
  private readonly stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(STRIPE_API_KEY, {
      apiVersion: '2024-06-20',
    });
  }

  async execute(
    customerId: string,
    paymentMethodId: string,
  ): Promise<Stripe.Customer> {
    if (!customerId) {
      throw new Error('User does not have a customer ID');
    }

    try {
      const updatedCustomer = await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      this.logger.log(
        `Default payment method updated for customer ${customerId} to ${paymentMethodId}`,
      );

      return updatedCustomer;
    } catch (error) {
      this.logger.error(
        `Failed to update default payment method for customer ${customerId}`,
        {
          error: error.message,
          customerId,
          paymentMethodId,
        },
      );
      throw error;
    }
  }
}
