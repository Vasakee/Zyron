import { Injectable, Logger } from '@nestjs/common';
import { STRIPE_API_KEY } from 'src/config';
import Stripe from 'stripe';

@Injectable()
export class StripeDeletePaymentMethodService {
  private readonly logger = new Logger(StripeDeletePaymentMethodService.name);
  private readonly stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(STRIPE_API_KEY, {
      apiVersion: '2024-06-20',
    });
  }

  async execute(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    try {
      const deletedPaymentMethod = await this.stripe.paymentMethods.detach(
        paymentMethodId,
      );

      this.logger.log(`Payment method ${paymentMethodId} deleted from Stripe`);

      return deletedPaymentMethod;
    } catch (error) {
      this.logger.error(
        `Failed to delete payment method ${paymentMethodId} from Stripe`,
        {
          error: error.message,
          paymentMethodId,
        },
      );
      throw error;
    }
  }
}
