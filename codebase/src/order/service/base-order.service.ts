import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { Order } from '../entity/order.entity';
import { OrderDto } from '../dto/create-order.dto';
import * as uuid from 'uuid';
import {
  OrderStatus,
  PaymentAction,
  PaymentStatementInterval,
  PaymentStatementStatus,
  Currency,
  OrderType,
  InvoicingMode,
  OrderPaymentType,
  SessionStatus,
  TransactionStatus,
  KitType,
  DeliveryMode,
} from 'src/enum';
import { chargePaymentMethodService as ChargePaymentMethodService } from 'src/payment/services/charge-payment-method';
import { BadRequestErrorException } from 'src/common';
import { PaymentStatement } from 'src/payment/entity/payment-statement.entity';
import { PaymentStatementItem } from 'src/payment/entity/payment-statement-item.entity';
import { Transaction } from 'src/payment/entity/transaction.entity';
import { DateTime } from 'luxon';
import { BILLING_PERIOD_END_DAY, SYSTEM_TIME_ZONE } from 'src/config/keys';
import { RetrievePriceService } from 'src/payment/services/retrieve-price';
import { StripePriceService } from 'src/payment/services/stripe-price.service';
import { FRONTEND_URL } from 'src/config';
import { CreateCheckoutSessionService } from 'src/payment/services/create-checkout-session.service';

type PaySession = {
  status?: SessionStatus;
  [key: string]: any;
};

@Injectable()
export class BaseOrderService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly createCheckoutSessionService: CreateCheckoutSessionService,
    private readonly chargePaymentMethodService: ChargePaymentMethodService,
    private readonly retrievePriceService: RetrievePriceService,
    private readonly stripePriceService: StripePriceService,
  ) { }

  private getBillingWindow(now: Date = new Date()): {
    startISO: string;
    endISO: string;
  } {
    const z = SYSTEM_TIME_ZONE;
    const dt = DateTime.fromJSDate(now).toISODate();
    const today = DateTime.fromISO(dt, { zone: z });
    const endDay = Number(BILLING_PERIOD_END_DAY) || 25;

    const startCandidate = today.set({ day: endDay });

    const start =
      today >= startCandidate
        ? startCandidate
        : startCandidate.minus({ months: 1 });

    const end = start.set({ day: endDay }).plus({ months: 1 });

    return { startISO: start.toISODate(), endISO: end.toISODate() };
  }

  private async getOrCreatePaymentStatement(
    manager: EntityManager,
    userId: string,
    currencyForWrite: Currency,
    now: Date,
  ): Promise<PaymentStatement> {
    const { startISO, endISO } = this.getBillingWindow(now);

    let ps = await manager
      .createQueryBuilder(PaymentStatement, 'ps')
      .setLock('pessimistic_write')
      .where('ps.userId = :userId', { userId })
      .andWhere('ps.currency = :currency', { currency: currencyForWrite })
      .andWhere('ps.interval = :interval', {
        interval: PaymentStatementInterval.Monthly,
      })
      .andWhere('ps.status = :status', { status: PaymentStatementStatus.Open })
      .andWhere('ps.periodStart = CAST(:startDay AS date)', {
        startDay: startISO,
      })
      .getOne();

    if (ps) {
      return ps;
    }

    ps = manager.create(PaymentStatement, {
      userId,
      currency: currencyForWrite,
      interval: PaymentStatementInterval.Monthly,
      periodStart: startISO,
      periodEnd: endISO,
      status: PaymentStatementStatus.Open,
    });

    try {
      return await manager.save(PaymentStatement, ps);
    } catch (error) {
      const err = error as { number?: number; code?: string };
      if (
        err?.number === 2601 ||
        err?.number === 2627 ||
        err?.code === '23505'
      ) {
        const existing = await manager
          .createQueryBuilder(PaymentStatement, 'ps')
          .where('ps.userId = :userId', { userId })
          .andWhere('ps.currency = :currency', { currency: currencyForWrite })
          .andWhere('ps.interval = :interval', {
            interval: PaymentStatementInterval.Monthly,
          })
          .andWhere('ps.status = :status', {
            status: PaymentStatementStatus.Open,
          })
          .andWhere('ps.periodStart = CAST(:startDay AS date)', {
            startDay: startISO,
          })
          .getOne();

        if (existing) {
          return existing;
        }
      }

      throw error;
    }
  }

  private async processPayAsYouGoPayment(
    data: OrderDto,
    referenceId: string,
  ): Promise<PaySession> {
    if (data.paymentAction === PaymentAction.PaymentMethod) {
      if (!data.paymentMethodId) {
        throw new BadRequestErrorException('Payment method id is required');
      }
      const session: PaySession = await this.chargePaymentMethodService.execute(
        data.firstName,
        data.lastName,
        data.userId,
        data.kitType,
        data.paymentMethodId,
        data.country,
        data.quantity,
        referenceId,
        data.isPreOrder,
      );
      if (session.status !== SessionStatus.Succeeded) {
        throw new BadRequestErrorException('Payment could not be processed');
      }
      return session;
    }

    const { successUrl, cancelUrl } = this.getCheckoutUrls();
    const checkout = await this.createCheckoutSessionService.execute({
      kitType: data.kitType as KitType,
      currency: data.currency as Currency,
      paymentType: OrderPaymentType.PLATFORM_ORDER,
      referenceId,
      quantity: data.quantity ?? 1,
      isPreOrder: data.isPreOrder,
      isAuthenticated: true,
      userId: data.userId,
      successUrl,
      cancelUrl,
    });

    return {
      id: checkout.id,
      url: checkout.url,
      sessionUrl: checkout.url,
    };
  }

  async execute(data: OrderDto, orderType: OrderType) {
    if (!data.quantity || data.quantity <= 0) {
      throw new BadRequestErrorException('Quantity is required');
    }

    if (orderType === OrderType.KitOnSite && data.quantity > 20) {
      throw new BadRequestErrorException(
        'Kit on site orders cannot exceed 20 kits per order',
      );
    }

    if (data.deliveryMode === DeliveryMode.DROPSHIP) {
      if (!data.firstName || !data.lastName || !data.email) {
        throw new BadRequestErrorException(
          'Client first name, last name, and email are required for dropship orders',
        );
      }
    } else if (data.deliveryMode === DeliveryMode.ON_SITE) {
      data.firstName = undefined;
      data.lastName = undefined;
      data.email = undefined;
    }

    const referenceId = uuid.v4();
    const currency = data.currency;

    if (orderType === OrderType.PayAsYouGo) {
      const { savedOrderId } = await this.dataSource.transaction(
        'READ COMMITTED',
        async (manager) => {
          const payload = new OrderDto().toEntity(data, referenceId);
          payload.currency = currency;
          payload.orderType = orderType;
          payload.invoicingMode = InvoicingMode.Immediate;
          payload.status = OrderStatus.Pending;

          const savedOrder = await manager.save(Order, payload);

          const existingTx = await manager.findOne(Transaction, {
            where: { referenceId },
            select: ['id'],
          });
          if (!existingTx) {
            const tx = manager.create(Transaction, {
              referenceId,
              userId: data.userId,
              status: TransactionStatus.Pending,
              currency,
            });
            await manager.save(Transaction, tx);
          }

          return { savedOrderId: savedOrder.id };
        },
      );

      let session: PaySession;
      try {
        session = await this.processPayAsYouGoPayment(data, referenceId);
      } catch (err) {
        await this.dataSource.transaction('READ COMMITTED', async (manager) => {
          await manager.update(
            Order,
            { id: savedOrderId },
            { status: OrderStatus.Pending },
          );
          await manager.update(
            Transaction,
            { referenceId },
            { status: TransactionStatus.Failed },
          );
        });
        throw err;
      }

      await this.dataSource.transaction('READ COMMITTED', async (manager) => {
        if (data.paymentAction === PaymentAction.PaymentMethod) {
          await manager.update(
            Order,
            { id: savedOrderId },
            { status: OrderStatus.Paid },
          );
          await manager.update(
            Transaction,
            { referenceId },
            { status: TransactionStatus.Successful },
          );
          return;
        }

        await manager.update(
          Order,
          { id: savedOrderId },
          { status: OrderStatus.Pending },
        );
        await manager.update(
          Transaction,
          { referenceId },
          { status: TransactionStatus.Pending },
        );
      });

      const finalOrder = await this.dataSource
        .getRepository(Order)
        .findOneOrFail({
          where: { id: savedOrderId },
        });

      return { ...new OrderDto().fromEntity(finalOrder), ...session };
    }

    const { stripePriceId } =
      await this.stripePriceService.findActivePriceOrThrow({
        kitType: data.kitType as KitType,
        paymentType: OrderPaymentType.PLATFORM_ORDER,
        currency: (currency as Currency)?.toUpperCase(),
      });
    const price = await this.retrievePriceService.execute(stripePriceId);
    if (!price || !price.unit_amount) {
      throw new BadRequestErrorException('Price not found for kit type');
    }

    return await this.dataSource.transaction(
      'SERIALIZABLE',
      async (manager) => {
        const ps = await this.getOrCreatePaymentStatement(
          manager,
          data.userId,
          currency,
          new Date(),
        );

        const payload = new OrderDto().toEntity(data, referenceId);
        payload.currency = currency;
        payload.orderType = orderType;
        payload.invoicingMode = InvoicingMode.EOM;
        payload.status = OrderStatus.PendingInvoice;

        const savedOrder = await manager.save(Order, payload);

        const clientName =
          [savedOrder.firstName, savedOrder.lastName]
            .filter(Boolean)
            .join(' ') || null;
        const clientEmail = savedOrder.email || null;

        const paymentStatementItem = manager.create(PaymentStatementItem, {
          paymentStatementId: ps.id,
          orderId: savedOrder.id,
          currency: currency,
          unitAmount: price.unit_amount,
          description: this.buildOrderDescription(savedOrder),
          quantity: savedOrder.quantity,
          clientName,
          clientEmail,
        });
        await manager.save(PaymentStatementItem, paymentStatementItem);

        return { ...new OrderDto().fromEntity(savedOrder) };
      },
    );
  }

  private buildOrderDescription(savedOrder: Order): string {
    const dt = DateTime.fromJSDate(savedOrder.createdAt).setZone(
      SYSTEM_TIME_ZONE || 'America/New_York',
    );
    const formatted = dt.toFormat('yyyy-LL-dd hh:mm a ZZZZ');
    switch (savedOrder.orderType) {
      case OrderType.KitOnSite:
        return `${savedOrder.quantity} kit on site purchased on ${formatted}`;
      case OrderType.MonthlyBilling:
        return `Client: ${[savedOrder.firstName, savedOrder.lastName]
          .filter(Boolean)
          .join(' ')} - ${savedOrder.quantity} kits - ${formatted}`;
      default:
        return `Order of ${savedOrder.quantity} kits on ${formatted}`;
    }
  }

  private getCheckoutUrls(): { successUrl: string; cancelUrl: string } {
    if (!FRONTEND_URL) {
      throw new Error('FRONTEND_URL is not set');
    }

    return {
      successUrl: `${FRONTEND_URL}/payment/success?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${FRONTEND_URL}/payment/cancel`,
    };
  }
}
