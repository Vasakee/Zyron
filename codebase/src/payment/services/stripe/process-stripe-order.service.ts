import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DateTime } from 'luxon';
import Stripe from 'stripe';
import { STRIPE_API_KEY } from 'src/config';
import { OrderStatus, TransactionStatus } from 'src/enum';
import { PractitionerKitPurchaseEvent } from 'src/helper/events/practitioner-kit-purchase';
import { KitPurchaseEvent } from 'src/helper/events/kit-purchase';
import { Order } from 'src/order/entity/order.entity';
import { Transaction } from 'src/payment/entity/transaction.entity';
import { CreateShippingDto } from 'src/payment/dto/shipping.dto';
import { StripePromotionCodeService } from './promotion-code.service';
import { StripePaymentReceiptService } from './payment-receipt';
import { Session } from './types/session';
import { StripePaymentUrlGeneratorService } from './payment-url-generator.service';

@Injectable()
export class ProcessStripeOrderService {
  private readonly logger = new Logger(ProcessStripeOrderService.name);
  private stripe: Stripe;

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly stripePromotionCodeService: StripePromotionCodeService,
    private readonly stripePaymentReceiptService: StripePaymentReceiptService,
    private readonly paymentUrlGenerator: StripePaymentUrlGeneratorService,
  ) {
    this.stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2024-06-20' });
  }

  async processClientReferenceOrder(
    referenceId: string,
    manager: any,
    session: Session,
    paymentIntent?: Stripe.PaymentIntent,
  ) {
    if (!session) {
      throw new Error('processClientReferenceOrder: session required');
    }

    if (session.mode !== 'payment' || session.payment_status !== 'paid') {
      this.logger.warn(
        `Unexpected session state for ${referenceId}: mode=${session.mode} payment_status=${session.payment_status}`,
      );
    }

    const pmId =
      typeof paymentIntent?.payment_method === 'string'
        ? paymentIntent.payment_method
        : paymentIntent?.payment_method?.id;

    const [order, transaction, paymentMethod] = await Promise.all([
      manager.findOneOrFail(Order, {
        where: { referenceId },
        relations: ['user'],
      }),
      manager.findOneOrFail(Transaction, { where: { referenceId } }),
      pmId ? this.stripe.paymentMethods.retrieve(pmId) : undefined,
    ]);

    if (order.status === OrderStatus.Paid) {
      this.logger.debug(
        `Order ${order.id} already Paid; skipping duplicate processing`,
      );
      return;
    }

    let promotionCode: string | null = null;
    let promotionCodeId: string | null = null;
    if ((session.total_details?.amount_discount ?? 0) > 0) {
      const promo = await this.stripePromotionCodeService.handlePromotionCodes(
        session,
      );
      promotionCode = promo.promotionCode;
      promotionCodeId = promo.promotionCodeId;
    }

    order.status = OrderStatus.Paid;
    order.completedAt = DateTime.utc().toJSDate();
    order.amountSubtotal = session.amount_subtotal ?? 0;
    order.amountTotal = session.amount_total ?? 0;
    order.amountTax = Math.abs(session.total_details?.amount_tax ?? 0);
    order.amountDiscount = Math.abs(
      session.total_details?.amount_discount ?? 0,
    );
    order.promotionCode = promotionCode;
    order.promotionCodeId = promotionCodeId;

    // Set payment URL if paymentIntent exists
    if (paymentIntent?.id) {
      order.paymentUrl = this.paymentUrlGenerator.generatePaymentUrl(
        paymentIntent.id,
      );
    }

    const slimPM = paymentMethod
      ? {
          id: paymentMethod.id,
          type: paymentMethod.type,
          card: paymentMethod.card
            ? {
                brand: paymentMethod.card.brand,
                last4: paymentMethod.card.last4,
                exp_month: paymentMethod.card.exp_month,
                exp_year: paymentMethod.card.exp_year,
              }
            : undefined,
          wallet: (paymentMethod as any).wallet?.type,
        }
      : null;

    transaction.status = TransactionStatus.Successful;
    transaction.metadata = slimPM ? JSON.stringify(slimPM) : null;

    await manager.transaction(async (trx: any) => {
      await trx.save(order);
      await trx.save(transaction);
    });

    if (paymentIntent) {
      try {
        await this.stripePaymentReceiptService.emitPaymentReceipt({
          order,
          session,
          paymentIntent,
        });
      } catch (e) {
        this.logger.error('payment.receipt emit failed', e as Error);
      }
    }

    const mailData: PractitionerKitPurchaseEvent = {
      email: order.user.email,
      customerName: order.firstName,
      practitionerName: order.user.firstName,
      date: new Date(order.createdAt).toDateString(),
      address: this.formatAddress(order),
      kitType: order.kitType,
    };
    this.eventEmitter.emit('practitioner.kit.purchase', mailData);
  }

  async processNewOrder(
    session: Session,
    manager: any,
    paymentIntent?: Stripe.PaymentIntent,
  ) {
    let totalQuantity = 0;
    let startingAfter: string | undefined;
    do {
      const page = await this.stripe.checkout.sessions.listLineItems(
        session.id,
        {
          limit: 100,
          starting_after: startingAfter,
        },
      );
      totalQuantity += page.data.reduce(
        (sum, item) => sum + (item.quantity ?? 0),
        0,
      );
      startingAfter = page.has_more ? page.data.at(-1)?.id : undefined;
    } while (startingAfter);

    const email = session.customer_details?.email ?? null;
    const name = session.customer_details?.name ?? null;
    const addr = session.customer_details?.address;
    const { city, country, line1, line2, postal_code, state } = addr ?? {};

    const referenceId = paymentIntent?.id || session.id;

    const existingOrder = await manager.findOne(Order, {
      where: { referenceId },
    });
    if (existingOrder) {
      this.logger.debug(
        `Order already exists for referenceId=${referenceId}; skipping create`,
      );
      return;
    }

    const newOrder = new CreateShippingDto().toEntity({
      name,
      email,
      city,
      country,
      line1,
      line2,
      postal_code,
      quantity: totalQuantity,
      state,
      payment_intent: referenceId,
    } as CreateShippingDto);

    (newOrder as Order).referenceId = referenceId;

    // Set payment URL if paymentIntent exists
    if (paymentIntent?.id) {
      (newOrder as Order).paymentUrl =
        this.paymentUrlGenerator.generatePaymentUrl(paymentIntent.id);
    }

    await manager.save(Order, newOrder);

    if (paymentIntent) {
      try {
        await this.stripePaymentReceiptService.emitPaymentReceipt({
          order: newOrder,
          session,
          paymentIntent,
        });
      } catch (e) {
        this.logger.error(
          'payment.receipt emit failed (new order)',
          e as Error,
        );
      }
    }

    const mailData: KitPurchaseEvent = {
      email,
      name,
      kitType: session.metadata?.kitType,
    };
    this.eventEmitter.emit('kit.purchase', mailData);
  }

  private formatAddress(order: Order): string {
    return [
      order.addressLineOne,
      order.addressLineTwo,
      order.postalCode,
      order.city,
      order.state,
      order.country,
    ]
      .filter(Boolean)
      .join(', ');
  }
}
