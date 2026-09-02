import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entity/order.entity';
import { OrderDto } from '../dto/create-order.dto';

@Injectable()
export class GetSingleOrderService {
  private readonly logger = new Logger(GetSingleOrderService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async execute(id: string) {
    try {
      const orders = await this.orderRepo.findOne({
        where: { id },
      });

      return new OrderDto().fromEntity(orders);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
