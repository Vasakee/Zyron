import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictErrorException } from 'src/common';
import { UpdateShippingDto } from '../dto/website-order.dto';
import { Order } from '../entity/order.entity';
import { Source } from 'src/enum';
import { OrderKit } from '../entity/order-kit.entity';

@Injectable()
export class UpdateWebsiteOrderService {
  private readonly logger = new Logger(UpdateWebsiteOrderService.name);
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderKit)
    private readonly orderKitRepo: Repository<OrderKit>,
  ) {}
  async execute(id: string, data: UpdateShippingDto) {
    try {
      const OrderRecord = await this.orderRepo.findOne({
        where: { id, source: Source.Website },
        relations: ['orderKits'],
      });

      if (!OrderRecord) {
        throw new ConflictErrorException('Order not found');
      }

      const existingKitIds = OrderRecord.orderKits.map((kit) => kit.kitId);

      const kitsToAdd = data.kitIds.filter(
        (kitId) => !existingKitIds.includes(kitId),
      );

      const kitsToDelete = OrderRecord.orderKits.filter(
        (kit) => !data.kitIds.includes(kit.kitId),
      );

      for (const kitId of kitsToAdd) {
        await this.orderKitRepo.save({
          orderId: OrderRecord.id,
          kitId,
          registrationStatus: 'no',
        });
      }

      for (const kit of kitsToDelete) {
        await this.orderKitRepo.delete(kit.id);
      }

      delete OrderRecord.orderKits;

      const payload = new UpdateShippingDto().updateEntity(OrderRecord, data);

      await this.orderRepo.save(payload);

      return null;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
