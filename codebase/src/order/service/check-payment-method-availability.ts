import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { PaymentMethodType } from 'src/enum';
import { RetrieveCheckoutSessionService } from 'src/payment/services/retrieve-checkout-session.service';

type ConsentDecisionResult = {
  requiresConsent: boolean;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    funding?: string;
  };
  sessionId: string;
  reason?: string;
};

@Injectable()
export class CheckPaymentMethodAvailabilityService {
  private readonly logger = new Logger(
    CheckPaymentMethodAvailabilityService.name,
  );

  constructor(
    private readonly retrieveCheckoutSessionService: RetrieveCheckoutSessionService,
  ) {}

  async execute(session_id: string): Promise<ConsentDecisionResult> {
    const TIMEOUT_MS = 1000;

    try {
      const session = await this.withTimeout(
        this.retrieveCheckoutSessionService.execute(session_id, {
          expand: [
            'payment_intent.payment_method',
            'setup_intent.payment_method',
          ],
        }),
        TIMEOUT_MS,
      );

      if (!session) return this.noConsent(session_id, 'Session not found');

      const pm = this.getExpandedPaymentMethod(session);

      if (!pm)
        return this.noConsent(session_id, 'No payment method on session');

      const isCard =
        pm.type === 'card' ||
        pm.type === (PaymentMethodType as any).Card ||
        !!pm.card;

      if (!isCard)
        return this.noConsent(session_id, 'Payment method is not a card');

      const card = this.extractCard(pm);
      if (!card) return this.noConsent(session_id, 'Card details incomplete');

      return {
        requiresConsent: true,
        card,
        sessionId: session_id,
      };
    } catch (err) {
      this.logger.warn(`Consent check degraded: ${String(err)}`);
      return this.noConsent(session_id, 'Degraded to no-consent');
    }
  }

  private getExpandedPaymentMethod(
    session: Stripe.Checkout.Session,
  ): Stripe.PaymentMethod | null {
    const pi = session.payment_intent as Stripe.PaymentIntent | null;
    const piPM = (pi?.payment_method ?? null) as
      | string
      | Stripe.PaymentMethod
      | null;
    if (piPM && typeof piPM === 'object') return piPM;

    const si = session.setup_intent as Stripe.SetupIntent | null;
    const siPM = (si?.payment_method ?? null) as
      | string
      | Stripe.PaymentMethod
      | null;
    if (siPM && typeof siPM === 'object') return siPM;

    return null;
  }

  private extractCard(
    pm: Stripe.PaymentMethod,
  ): ConsentDecisionResult['card'] | null {
    if (pm.type !== 'card' || !pm.card) return null;
    const { brand, last4, exp_month, exp_year, funding } = pm.card;
    if (!brand || !last4 || !exp_month || !exp_year) return null;
    return { brand, last4, exp_month, exp_year, funding: funding || 'unknown' };
  }

  private noConsent(sessionId: string, reason: string): ConsentDecisionResult {
    return { requiresConsent: false, sessionId, reason };
  }

  private async withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
    return await Promise.race<T>([
      p,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), ms),
      ),
    ]);
  }
}
