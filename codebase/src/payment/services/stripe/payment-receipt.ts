import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Stripe from 'stripe';
import { STRIPE_API_KEY } from 'src/config';
import { Order } from 'src/order/entity/order.entity';
import { DateTime } from 'luxon';
import { slugToTitle } from 'src/common/utils';
import { Session } from './types/session';

interface EmitPaymentReceiptParams {
  order: Order;
  paymentIntent: Stripe.PaymentIntent;
  session?: Session;
}

@Injectable()
export class StripePaymentReceiptService {
  private stripe: Stripe;

  constructor(private readonly eventEmitter: EventEmitter2) {
    this.stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2024-06-20' });
  }

  async emitPaymentReceipt(params: EmitPaymentReceiptParams) {
    const { order, paymentIntent, session } = params;

    // Financial details from Stripe (PaymentIntent, Session)
    const amountTotal = paymentIntent.amount;
    const currency = paymentIntent.currency;
    const subtotal = session?.amount_subtotal ?? amountTotal;
    const discount = session?.total_details?.amount_discount ?? 0;

    let promotionCode: string | undefined;
    if (session?.total_details?.breakdown?.discounts?.[0]?.discount?.promotion_code) {
      const promoCodeObj = await this.stripe.promotionCodes.retrieve(
        typeof session.total_details.breakdown.discounts[0].discount.promotion_code === 'string'
          ? session.total_details.breakdown.discounts[0].discount.promotion_code
          : session.total_details.breakdown.discounts[0].discount.promotion_code.id
      );
      promotionCode = promoCodeObj.code;
    }

    // Order and Client details (can be from local Order entity)
    const quantity = parseInt(order?.quantity?.toString() || '1', 10);
    const kitType = order?.kitType || 'N/A';
    const clientName =
      order.firstName || order.lastName
        ? `${order.firstName ?? ''} ${order.lastName ?? ''}`.trim()
        : undefined;
    const referenceId = order?.referenceId || paymentIntent.id;

    // Billing details
    const billedToName =
      order?.user?.firstName || order.user?.lastName
        ? `${order.user.firstName ?? ''} ${order.user.lastName ?? ''}`.trim()
        : undefined;
    const billedToEmail = order?.user?.email || undefined;

    // Payment method details
    let paymentMethodBrand: string | undefined;
    let paymentMethodLast4: string | undefined;
    const latestChargeId = paymentIntent.latest_charge as string | undefined;
    if (latestChargeId) {
      const charge: Stripe.Charge = await this.stripe.charges.retrieve(
        latestChargeId,
      );
      paymentMethodBrand = charge?.payment_method_details?.card?.brand;
      paymentMethodLast4 = charge?.payment_method_details?.card?.last4;
    }

    // Calculate unit price
    const unitPrice = quantity > 0 ? Math.round(subtotal / quantity) : subtotal;

    // Date and time formatting
    const date = order?.completedAt
      ? DateTime.fromJSDate(order.completedAt)
      : DateTime.local();
    const formattedDate = date.toFormat('MMM dd, yyyy');
    const formattedTime = date.toFormat('h:mm:ss a');

    const eventData = {
      currency,
      receiptId: referenceId,
      paymentMethodBrand,
      paymentMethodLast4,

      billedToName,
      billedToEmail,
      clientName,
      date: formattedDate,
      time: formattedTime,

      testType: slugToTitle(kitType),
      quantity,
      unitPrice: unitPrice / 100, // Convert from cents to dollars
      subtotal: subtotal / 100, // Convert from cents to dollars
      discount: discount / 100, // Convert from cents to dollars
      promotionCode,
      total: amountTotal / 100, // Convert from cents to dollars
      amountPaid: amountTotal / 100, // Convert from cents to dollars
    };

    this.eventEmitter.emit('payment.receipt', eventData);
  }
}
