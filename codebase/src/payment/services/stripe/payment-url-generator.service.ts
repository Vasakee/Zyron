import { Injectable } from '@nestjs/common';
import { STRIPE_DASHBOARD_BASE_URL, STRIPE_API_KEY } from 'src/config';

@Injectable()
export class StripePaymentUrlGeneratorService {
  private readonly baseUrl: string;
  private readonly isTestMode: boolean;
  private readonly modePrefix: string;

  constructor() {
    // Normalize this sir, in the case trailing slash in base URL
    const url = STRIPE_DASHBOARD_BASE_URL || 'https://dashboard.stripe.com';
    this.baseUrl = url.replace(/\/+$/, '');

    this.isTestMode = STRIPE_API_KEY?.startsWith('sk_test_') ?? false;
    this.modePrefix = this.isTestMode ? '/test' : '';
  }

  private buildUrl(path: string): string {
    return `${this.baseUrl}${this.modePrefix}${path}`;
  }

  /**
   * Payment Intent URL
   */
  generatePaymentIntentUrl(paymentIntentId: string): string | null {
    if (!paymentIntentId) return null;
    return this.buildUrl(`/payments/${paymentIntentId}`);
  }

  /**
   * Checkout Session URL
   */
  generateCheckoutSessionUrl(sessionId: string): string | null {
    if (!sessionId) return null;
    return this.buildUrl(`/checkout/sessions/${sessionId}`);
  }

  /**
   * Alias for generating a payment URL (still PaymentIntent)
   */
  generatePaymentUrl(paymentIntentId: string): string | null {
    return this.generatePaymentIntentUrl(paymentIntentId);
  }
}
