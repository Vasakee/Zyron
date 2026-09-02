import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { PageMetaDto, PageOptionsDto } from 'src/common';
import { OrderKit } from '../entity/order-kit.entity';
import { OrderKitsDto, OrdersKitQueryDto } from '../dto/create-order-kit.dto';
@Injectable()
export class GetOrderKitService {
  private readonly logger = new Logger(GetOrderKitService.name);

  constructor(
    @InjectRepository(OrderKit)
    private readonly orderKitRepo: Repository<OrderKit>,
  ) {}

  async execute(
    id: string,
    pageOptionsDto: PageOptionsDto,
    query: OrdersKitQueryDto,
  ) {
    try {
      const { take, skip } = pageOptionsDto;
      const { searchQuery } = query;
      const sort = 'DESC';

      const dbQuery: SelectQueryBuilder<OrderKit> = this.orderKitRepo
        .createQueryBuilder('order-kits')
        .leftJoinAndSelect('order-kits.order', 'order')
        .where('order-kits.orderId = :id', { id });

      if (searchQuery) {
        dbQuery.andWhere('order-kits.kitId Like :searchquery', {
          searchQuery: `%${searchQuery}%`,
        });
      }

      const response = await dbQuery
        .take(take)
        .skip(skip)
        .orderBy('order-kits.createdAt', sort)
        .getManyAndCount();

      const [OrderKits, total] = response;

      const pageMetaDto = new PageMetaDto({
        itemCount: total,
        pageOptionsDto,
      });

      const result = OrderKits.map((orderKits) =>
        new OrderKitsDto().fromEntity(orderKits),
      );

      return { result, pageMetaDto };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
