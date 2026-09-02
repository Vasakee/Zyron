import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { PageMetaDto, PageOptionsDto } from 'src/common';
import { Source } from 'src/enum';
import { Order } from 'src/order/entity/order.entity';
import { OrdersQueryDto } from 'src/order/dto/create-order.dto';
import { SaveOrderExternalDto } from '../dto/save-order-external.dto';

@Injectable()
export class GetOrdersExternalService {
  private readonly logger = new Logger(GetOrdersExternalService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async execute(pageOptionsDto: PageOptionsDto, query: OrdersQueryDto) {
    try {
      const { take, skip } = pageOptionsDto;
      const { searchQuery, status } = query;
      const sort = 'DESC';

      const dbQuery: SelectQueryBuilder<Order> = this.orderRepo
        .createQueryBuilder('orders')
        .leftJoinAndSelect('orders.orderKits', 'kits')
        .leftJoinAndSelect('orders.user', 'user')
        .where('orders.source = :source', { source: Source.Elyxium });

      if (searchQuery) {
        dbQuery.andWhere(
          new Brackets((qb) => {
            qb.where('orders.firstName LIKE :searchQuery', {
              searchQuery: `%${searchQuery}%`,
            })
              .orWhere('orders.lastName LIKE :searchQuery', {
                searchQuery: `%${searchQuery}%`,
              })
              .orWhere('user.firstName LIKE :searchQuery', {
                searchQuery: `%${searchQuery}%`,
              })
              .orWhere('user.lastName LIKE :searchQuery', {
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

      const [orders, total] = await dbQuery
        .take(take)
        .skip(skip)
        .orderBy('orders.createdAt', sort)
        .getManyAndCount();

      const totalCount = await this.orderRepo.count({
        where: { source: Source.Elyxium },
      });

      const counts = await this.orderRepo
        .createQueryBuilder('orders')
        .select(['orders.status', 'COUNT(orders.id) as count'])
        .where('orders.source = :source', { source: Source.Elyxium })
        .groupBy('orders.status')
        .getRawMany();

      const pageMetaDto = new PageMetaDto({
        itemCount: total,
        pageOptionsDto,
      });

      const result = orders.map((order) =>
        new SaveOrderExternalDto().fromEntity(order),
      );

      return { result, totalCount, counts, pageMetaDto };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
