import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { DateTime } from 'luxon';
import { STRIPE_API_KEY } from 'src/config';
import {
  OrderPaymentType,
  OrderStatus,
  ReplacementKitStatus,
  SessionStatus,
  TransactionStatus,
} from 'src/enum';
import { Order } from 'src/order/entity/order.entity';
import { Transaction } from 'src/payment/entity/transaction.entity';
import { KitReplacementRequest } from 'src/replacement-kit/entity/kit-replacement-request.entity';
import { Session } from './types/session';
import { StripeWaitlistWebhookService } from './waitlist-webhook.service';
import { ProcessStripeOrderService } from './process-stripe-order.service';

@Injectable()
export class StripeCheckoutSessionCompletedService {
  private readonly logger = new Logger(
    StripeCheckoutSessionCompletedService.name,
  );
  private stripe: Stripe;

  constructor(
    private readonly stripeWaitlistWebhookService: StripeWaitlistWebhookService,
    private readonly processStripeOrderService: ProcessStripeOrderService,
  ) {
    this.stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2024-06-20' });
  }

  async execute(session: Session, manager: any) {
    if (session.payment_status !== 'paid') return;

    const referenceId =
      session.client_reference_id || session.metadata?.referenceId;
    const paymentType = (session.metadata?.paymentType || '')
      .toString()
      .toUpperCase();

    if (
      paymentType === OrderPaymentType.KIT_REPLACEMENT_ORDER ||
      (referenceId && referenceId.startsWith('repl_'))
    ) {
      await this.handleReplacementKitPayment(referenceId, session, manager);
      return;
    }

    const paymentIntentId = session.payment_intent as string;

    if (!paymentIntentId && session.amount_total === 0) {
      if (referenceId) {
        await this.processStripeOrderService.processClientReferenceOrder(
          referenceId,
          manager,
          session,
        );
      } else {
        await this.processStripeOrderService.processNewOrder(session, manager);
      }
      return;
    }

    const paymentIntent = await this.stripe.paymentIntents.retrieve(
      paymentIntentId,
    );

    if (paymentIntent.status === SessionStatus.Succeeded) {
      if (referenceId) {
        await this.processStripeOrderService.processClientReferenceOrder(
          referenceId,
          manager,
          session,
          paymentIntent,
        );
      } else {
        await this.processStripeOrderService.processNewOrder(
          session,
          manager,
          paymentIntent,
        );
      }
    }
  }

  private async handleReplacementKitPayment(
    referenceId: string | undefined,
    session: Session,
    manager: any,
  ): Promise<void> {
    if (!referenceId) {
      this.logger.warn(
        `Replacement kit payment missing referenceId for session ${session.id}`,
      );
      return;
    }

    const request = await manager.findOne(KitReplacementRequest, {
      where: { referenceId },
    });

    if (!request) {
      this.logger.warn(
        `Replacement kit request not found for referenceId ${referenceId}`,
      );
      return;
    }

    const paymentDate = session.created
      ? DateTime.fromSeconds(session.created).toJSDate()
      : DateTime.utc().toJSDate();

    if (
      request.status !== ReplacementKitStatus.PAID ||
      !request.paymentDate ||
      !request.paymentSessionId
    ) {
      await manager.update(
        KitReplacementRequest,
        { id: request.id },
        {
          status: ReplacementKitStatus.PAID,
          paymentSessionId: session.id,
          paymentDate,
        },
      );
    }

    const order = await manager.findOne(Order, {
      where: { referenceId },
    });

    if (order && order.status !== OrderStatus.Paid) {
      order.status = OrderStatus.Paid;
      order.completedAt = DateTime.utc().toJSDate();
      order.amountSubtotal = session.amount_subtotal ?? 0;
      order.amountTotal = session.amount_total ?? 0;
      order.amountTax = Math.abs(session.total_details?.amount_tax ?? 0);
      order.amountDiscount = Math.abs(
        session.total_details?.amount_discount ?? 0,
      );
      await manager.save(Order, order);
    }

    const transaction = await manager.findOne(Transaction, {
      where: { referenceId },
    });

    if (transaction && transaction.status !== TransactionStatus.Successful) {
      transaction.status = TransactionStatus.Successful;
      await manager.save(Transaction, transaction);
    }
  }
}
