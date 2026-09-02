import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { Order } from '../entity/order.entity';
import { OrderDto, OrdersQueryDto } from '../dto/create-order.dto';
import { PageMetaDto, PageOptionsDto } from 'src/common';
import { Source } from 'src/enum';

@Injectable()
export class GetPractitionerWaitlistOrderService {
  private readonly logger = new Logger(
    GetPractitionerWaitlistOrderService.name,
  );

  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
  ) {}

  async execute(
    userId: string,
    pageOptionsDto: PageOptionsDto,
    query: OrdersQueryDto,
  ) {
    try {
      const { take, skip } = pageOptionsDto;
      const { searchQuery, status } = query;
      const sort = 'DESC';

      const dbQuery: SelectQueryBuilder<Order> = this.orderRepo
        .createQueryBuilder('orders')
        .leftJoinAndSelect('orders.orderKits', 'kits')
        .leftJoinAndSelect('orders.user', 'user')
        .where('orders.userId = :userId', { userId })
        .andWhere('orders.source = :source', { source: Source.Waitlist });

      if (searchQuery) {
        dbQuery.andWhere(
          new Brackets((qb) => {
            qb.where('orders.firstName LIKE :searchQuery', {
              searchQuery: `%${searchQuery}%`,
            }).orWhere('kits.kitId LIKE :searchQuery', {
              searchQuery: `%${searchQuery}%`,
            });
          }),
        );
      }

      if (status) {
        dbQuery.andWhere('orders.status = :status', {
          status,
        });
      }

      const [response, totalCount, counts] = await Promise.all([
        dbQuery
          .take(take)
          .skip(skip)
          .orderBy('orders.createdAt', sort)
          .getManyAndCount(),
        this.orderRepo.count({ where: { userId, source: Source.Waitlist } }),
        this.orderRepo
          .createQueryBuilder('orders')
          .select(['orders.status', 'COUNT(orders.id) as count'])
          .where('orders.userId = :userId', { userId })
          .andWhere('orders.source = :source', { source: Source.Waitlist })
          .groupBy('orders.status')
          .getRawMany(),
      ]);

      const [Orders, total] = response;

      const pageMetaDto = new PageMetaDto({
        itemCount: total,
        pageOptionsDto,
      });

      const result = Orders.map((Order) => new OrderDto().fromEntity(Order));

      return { result, totalCount, counts, pageMetaDto };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
