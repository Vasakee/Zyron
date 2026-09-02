import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entity/order.entity';
import { OrderStatus } from 'src/enum';

@Injectable()
export class CancelOrderService {
  private readonly logger = new Logger(CancelOrderService.name);

  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
  ) {}

  async execute(id: string) {
    try {
      const order = await this.orderRepo.findOne({
        where: { id },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // Validate that the order status is one of: pending, paid, or shipped
      const allowedStatuses = [
        OrderStatus.Pending,
        OrderStatus.Paid,
        OrderStatus.Shipped,
      ];

      if (!allowedStatuses.includes(order.status as OrderStatus)) {
        throw new BadRequestException(
          `Order cannot be cancelled. Current status: ${order.status}. Only orders with status 'pending', 'paid', or 'shipped' can be cancelled.`,
        );
      }

      // Update order status to cancelled
      order.status = OrderStatus.Cancelled;

      const result = await this.orderRepo.save(order);

      this.logger.log(`Order ${id} cancelled successfully`);

      return {
        id: result.id,
        status: result.status,
        referenceId: result.referenceId,
        updatedAt: result.updatedAt,
      };
    } catch (error) {
      this.logger.error(`Error cancelling order ${id}:`, error);
      throw error;
    }
  }
}
