import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Currency, OrderStatus, Source, SupoortMailStatus } from 'src/enum';
import { Reminder } from 'src/reminders/entity/reminder.entity';
import { Order } from '../entity/order.entity';
import * as uuid from 'uuid';
import { ShotgunWaitlist } from '../entity/shotgun-waitlist.entity';
import { ProcessSecondWaitlistPaymentService } from 'src/payment/services/process-second-waitlist-payment';
import { BadRequestErrorException, NotFoundErrorException } from 'src/common';
import { FRONTEND_URL } from 'src/config';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);
  constructor(
    @InjectRepository(Reminder)
    private readonly reminderRepo: Repository<Reminder>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(ShotgunWaitlist)
    private readonly shotgunRepo: Repository<ShotgunWaitlist>,
    private readonly processSecondWaitlistPaymentService: ProcessSecondWaitlistPaymentService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async sendReminderEmails() {
    try {
      const todayUTC = new Date().toISOString().split('T')[0];

      const reminders = await this.reminderRepo.find({
        where: {
          slug: In([
            'first-waitlist-reminder',
            'second-waitlist-reminder',
            'third-waitlist-reminder',
          ]),
          status: OrderStatus.Pending,
        },
      });

      for (const reminder of reminders) {
        const reminderDateUTC = new Date(reminder.date)
          .toISOString()
          .split('T')[0];

        if (todayUTC === reminderDateUTC) {
          reminder.slug === 'third-waitlist-reminder'
            ? await this.sendThirdReminder(reminder.slug)
            : await this.sendReminder(reminder.slug);

          this.logger.log(`Sending reminder: ${reminder.slug}`);

          reminder.status = SupoortMailStatus.SENT;
          await this.reminderRepo.save(reminder);
        } else {
          this.logger.log(`Skipping reminder ${reminder.slug} (Not today)`);
        }
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  private async sendReminder(reminderType: string) {
    const orders = await this.orderRepo.find({
      where: { status: OrderStatus.PartialPayment },
    });

    for (const order of orders) {
      const paymentLink = await this.generatePaymentLink(order);
      const mailData = {
        email: order.email,
        name: order.firstName,
        quantity: order.quantity,
        link: paymentLink,
      };
      this.eventEmitter.emit(`waitlist.email.${reminderType}`, mailData);
      this.logger.log(`Sent ${reminderType} reminder to ${order.email}`);
    }
  }

  private async sendThirdReminder(reminderType: string) {
    if (reminderType !== 'third-waitlist-reminder') {
      return;
    }

    const orders = await this.orderRepo.find({
      where: { status: OrderStatus.PartialPayment },
    });

    for (const order of orders) {
      const paymentLink = `${FRONTEND_URL}/waitlist/pay/${order.id}`;
      const mailData = {
        email: order.email,
        name: order.firstName,
        quantity: order.quantity,
        link: paymentLink,
      };
      this.eventEmitter.emit(`waitlist.email.${reminderType}`, mailData);
      this.logger.log(`Sent ${reminderType} reminder to ${order.email}`);
    }
  }

  private async generatePaymentLink(order: Order) {
    const finalReferenceId = uuid.v4();

    order.finalReferenceId = finalReferenceId;

    const [session] = await Promise.all([
      this.processSecondWaitlistPaymentService.execute(finalReferenceId, {
        currency: order.currency as Currency,
        initialReferenceId: order.referenceId,
        quantity: order.quantity,
      }),
      this.orderRepo.save(order),
      this.shotgunRepo.update(
        { referenceId: order.referenceId },
        { finalReferenceId },
      ),
    ]);

    if (!session || !session.url) {
      throw new Error(
        'Payment session creation failed, session URL is missing',
      );
    }
    return session.url;
  }

  async generateSecondPaymentLink(orderId: string) {
    try {
      const order = await this.orderRepo.findOne({ where: { id: orderId } });
      if (!order) {
        throw new NotFoundErrorException('Order not found');
      }

      if (order.source !== Source.Waitlist) {
        throw new BadRequestErrorException('Order is not on the waitlist');
      }

      if (order.status === OrderStatus.Paid) {
        throw new BadRequestErrorException(
          'Payment for this order has been completed',
        );
      }

      if (order.status === OrderStatus.Pending) {
        throw new BadRequestErrorException(
          'Please complete the initial waitlist payment to proceed',
        );
      }

      const finalReferenceId = uuid.v4();

      order.finalReferenceId = finalReferenceId;

      const [session] = await Promise.all([
        this.processSecondWaitlistPaymentService.execute(finalReferenceId, {
          currency: order.currency as Currency,
          initialReferenceId: order.referenceId,
          quantity: order.quantity,
        }),
        this.orderRepo.save(order),
        this.shotgunRepo.update(
          { referenceId: order.referenceId },
          { finalReferenceId },
        ),
      ]);

      return session.url;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
