import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DateTime } from 'luxon';
import Stripe from 'stripe';
import { OrderStatus, TransactionStatus, WaitlistStatus } from 'src/enum';
import { WaitlistEvent } from 'src/helper/events/waitlist-first-payment';
import { Order } from 'src/order/entity/order.entity';
import { ShotgunWaitlist } from 'src/order/entity/shotgun-waitlist.entity';
import { Transaction } from 'src/payment/entity/transaction.entity';
import { Session } from './types/session';
import { StripePaymentUrlGeneratorService } from './payment-url-generator.service';

@Injectable()
export class StripeWaitlistWebhookService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly paymentUrlGenerator: StripePaymentUrlGeneratorService,
  ) {}

  async handleFirstWaitlistPaymentAddress(
    referenceId: string,
    waitlist: ShotgunWaitlist,
    session: Session,
    manager: any,
    paymentIntent?: Stripe.PaymentIntent,
  ) {
    const [order, transaction] = await Promise.all([
      manager.findOneOrFail(Order, {
        where: { referenceId },
      }),
      manager.findOneOrFail(Transaction, { where: { referenceId } }),
    ]);

    if (waitlist) {
      const address = session?.shipping_details?.address
        ? session.shipping_details.address
        : session?.shipping?.address
        ? session.shipping?.address
        : session?.customer_details?.address;

      const { city, country, line1, line2, postal_code, state } = address;

      order.city = city;
      order.addressLineOne = line1;
      order.addressLineTwo = line2;
      order.postalCode = postal_code;
      order.state = state;
      order.country = country;
      order.status = OrderStatus.PartialPayment;
      order.completedAt = DateTime.local().toJSDate();

      // Set payment URL if paymentIntent exists
      if (paymentIntent?.id) {
        order.paymentUrl = this.paymentUrlGenerator.generatePaymentUrl(
          paymentIntent.id,
        );
      }

      waitlist.city = city;
      waitlist.addressLineOne = line1;
      waitlist.addressLineTwo = line2;
      waitlist.postalCode = postal_code;
      waitlist.state = state;
      waitlist.status = WaitlistStatus.Paid;
      transaction.status = TransactionStatus.Successful;

      await Promise.all([
        manager.save(order),
        manager.save(waitlist),
        manager.save(transaction),
      ]);

      const mailData: WaitlistEvent = {
        email: order.email,
        name: order.firstName,
        quantity: order.quantity.toString(),
      };

      this.eventEmitter.emit('waitlistfirst.email', mailData);
    }
  }

  async handleSecondWaitlistPaymentAddress(
    referenceId: string,
    waitlist: ShotgunWaitlist,
    manager: any,
    paymentIntent?: Stripe.PaymentIntent,
  ) {
    const [order, transaction] = await Promise.all([
      manager.findOneOrFail(Order, {
        where: { finalReferenceId: referenceId },
      }),
      manager.findOneOrFail(Transaction, { where: { referenceId } }),
    ]);

    if (waitlist) {
      order.status = OrderStatus.Paid;
      order.completedAt = DateTime.local().toJSDate();
      transaction.status = TransactionStatus.Successful;

      // Set payment URL if paymentIntent exists
      if (paymentIntent?.id) {
        order.paymentUrl = this.paymentUrlGenerator.generatePaymentUrl(
          paymentIntent.id,
        );
      }

      await Promise.all([manager.save(order), manager.save(transaction)]);

      const mailData: WaitlistEvent = {
        email: order.email,
        name: order.firstName,
        quantity: order.quantity.toString(),
      };

      this.eventEmitter.emit('waitlistsecond.email', mailData);
    }
  }
}
