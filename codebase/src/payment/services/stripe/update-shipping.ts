import { Injectable, Logger } from '@nestjs/common';
import { OrderStatus, ShippingStatus } from 'src/enum';
import { DataSource, In, LessThanOrEqual } from 'typeorm';
import { DateTime } from 'luxon';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ShippingUpdateEvent } from 'src/helper/events/shipping-update';
import { Shipping } from 'src/order/entity/shipping.entity';
import { Order } from 'src/order/entity/order.entity';

@Injectable()
export class StripeUpdateShippingService {
  private readonly logger = new Logger(StripeUpdateShippingService.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly dataSource: DataSource,
  ) {}

  async execute() {
    const twoDaysAgo = DateTime.local().minus({ days: 2 }).toJSDate();

    try {
      await this.dataSource.transaction(async (manager) => {
        await this.updateShippings(manager, twoDaysAgo);
        await this.updateOrders(manager, twoDaysAgo);
      });
    } catch (error) {
      this.logger.error('Error during transaction:', error);
      throw error;
    }
  }

  private async updateShippings(manager, twoDaysAgo: Date) {
    const shippings = await manager.find(Shipping, {
      where: {
        status: ShippingStatus.Paid,
        completedAt: LessThanOrEqual(twoDaysAgo),
      },
    });

    if (shippings.length > 0) {
      const shippingIds = shippings.map((shipping) => shipping.id);

      await manager.update(
        Shipping,
        { id: In(shippingIds) },
        { status: ShippingStatus.Shipped },
      );

      for (const shipping of shippings) {
        const mailData: ShippingUpdateEvent = {
          name: shipping.fullName.split(' ')[0],
          email: shipping.email,
          link: 'https://www.loom.com/share/5fee33c1d5b144d0881c31fd4e84c5ff',
          here: 'https://vitract.com/customs/',
        };

        this.eventEmitter.emit('shipping.update', mailData);
      }
    } else {
      this.logger.log('No shippings to update');
    }
  }

  private async updateOrders(manager, twoDaysAgo: Date) {
    const orders = await manager.find(Order, {
      where: {
        status: OrderStatus.Paid,
        completedAt: LessThanOrEqual(twoDaysAgo),
      },
    });

    if (orders.length > 0) {
      const orderIds = orders.map((order) => order.id);

      await manager.update(
        Order,
        { id: In(orderIds) },
        { status: OrderStatus.Shipped },
      );

      for (const order of orders) {
        const mailData: ShippingUpdateEvent = {
          name: order.firstName,
          email: order.email,
          link: 'https://www.loom.com/share/5fee33c1d5b144d0881c31fd4e84c5ff',
          here: 'https://vitract.com/customs/',
        };

        this.eventEmitter.emit('shipping.update', mailData);
      }
    } else {
      this.logger.log('No orders to update');
    }
  }
}
