import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entity/order.entity';

@Injectable()
export class DeleteOrdersService {
  private readonly logger = new Logger(DeleteOrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async execute(id: string) {
    try {
      await this.orderRepo.delete({
        id,
      });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
