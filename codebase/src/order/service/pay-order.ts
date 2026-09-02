import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entity/order.entity';
import { OrderDto } from '../dto/create-order.dto';
import {
  Currency,
  KitType,
  OrderPaymentType,
  OrderStatus,
  PaymentGateway,
  PaymentType,
} from 'src/enum';
import { FRONTEND_URL } from 'src/config';
import { Transaction } from 'src/payment/entity/transaction.entity';
import { CreateCheckoutSessionService } from 'src/payment/services/create-checkout-session.service';

@Injectable()
export class PayOrderService {
  private readonly logger = new Logger(PayOrderService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly createCheckoutSessionService: CreateCheckoutSessionService,
  ) {}

  async execute(id: string) {
    try {
      const order = await this.orderRepo.findOne({
        where: { id },
      });

      if (order.status === OrderStatus.PaymentPending) {
        const { successUrl, cancelUrl } = this.getCheckoutUrls();
        const checkout = await this.createCheckoutSessionService.execute({
          kitType: order.kitType as KitType,
          currency: order.currency as Currency,
          paymentType: OrderPaymentType.PLATFORM_ORDER,
          referenceId: order.referenceId,
          quantity: order.quantity ?? 1,
          isAuthenticated: true,
          userId: order.userId,
          successUrl,
          cancelUrl,
        });

        await this.dataSource.transaction(async (manager) => {
          const existing = await manager.findOne(Transaction, {
            where: { referenceId: order.referenceId },
            select: ['id'],
          });
          if (!existing) {
            await manager.save(Transaction, {
              referenceId: order.referenceId,
              userId: order.userId,
              type: PaymentType.Pay,
              gateway: PaymentGateway.Stripe,
            });
          }
        });

        return {
          ...new OrderDto().fromEntity(order),
          paymentLink: checkout.url,
        };
      }
    } catch (error) {
      this.logger.error(error);
      throw error;
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
