import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, IsNull, Repository, SelectQueryBuilder } from 'typeorm';
import { OrdersQueryDto } from '../dto/create-order.dto';
import { PageMetaDto, PageOptionsDto } from 'src/common';
import { Source } from 'src/enum';
import { Order } from '../entity/order.entity';
import { WebsiteOrderDto } from '../dto/website-order.dto';
@Injectable()
export class GetWebsiteOrdersService {
  private readonly logger = new Logger(GetWebsiteOrdersService.name);

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
        .where('orders.source IN (:...sources)', {
          sources: [Source.Website, Source.Elyxium],
        })
        .andWhere('orders.userId IS NULL');

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
        this.orderRepo.count({
          where: {
            userId: IsNull(),
            source: In([Source.Website, Source.Elyxium]),
          },
        }),
        this.orderRepo
          .createQueryBuilder('orders')
          .select(['orders.status', 'COUNT(orders.id) as count'])
          .where('orders.source IN (:...sources)', {
            sources: [Source.Website, Source.Elyxium],
          })
          .andWhere('orders.userId IS NULL')
          .groupBy('orders.status')
          .getRawMany(),
      ]);

      const [Orders, total] = response;

      const pageMetaDto = new PageMetaDto({
        itemCount: total,
        pageOptionsDto,
      });

      const result = Orders.map((order) =>
        new WebsiteOrderDto().fromEntity(order),
      );

      return { result, totalCount, counts, pageMetaDto };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
