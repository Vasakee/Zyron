import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  In,
  IsNull,
  Not,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { Order } from '../entity/order.entity';
import { OrdersQueryDto, OrderDto } from '../dto/create-order.dto';
import { PageMetaDto, PageOptionsDto } from 'src/common';
import { Source, OrderType } from 'src/enum';
import { DateTime } from 'luxon';
import { PaymentStatementItem } from 'src/payment/entity/payment-statement-item.entity';
import { BILLING_PERIOD_START_DAY, SYSTEM_TIME_ZONE } from 'src/config';

@Injectable()
export class GetAllOrderService {
  private readonly logger = new Logger(GetAllOrderService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async execute(
    pageOptionsDto: PageOptionsDto,
    query: OrdersQueryDto,
    orderType?: OrderType,
  ) {
    try {
      const { take, skip } = pageOptionsDto;
      const { searchQuery, status } = query;
      const sort: 'ASC' | 'DESC' = 'DESC';

      const tz = SYSTEM_TIME_ZONE || 'America/New_York';
      const nowET = DateTime.now().setZone(tz);
      const billingStartDay = parseInt(BILLING_PERIOD_START_DAY || '26', 10);
      const billingEndDay = billingStartDay - 1; // Day before start (was 25)

      const startET =
        nowET.day >= billingStartDay
          ? nowET.set({ day: billingStartDay })
          : nowET.minus({ months: 1 }).set({ day: billingStartDay });

      const endET =
        nowET.day >= billingStartDay
          ? nowET.plus({ months: 1 }).set({ day: billingEndDay })
          : nowET.set({ day: billingEndDay });

      const startUtc = startET.toUTC().startOf('day').toJSDate();
      const endUtc = endET.toUTC().endOf('day').toJSDate();

      const sources = [Source.Platform, Source.Elyxium];

      const dbQuery: SelectQueryBuilder<Order> = this.orderRepo
        .createQueryBuilder('orders')
        .leftJoinAndSelect('orders.orderKits', 'kits')
        .leftJoinAndSelect('orders.user', 'user')
        .leftJoinAndSelect(
          'orders.paymentStatementItem',
          'paymentStatementItem',
        )
        .where('orders.source IN (:...sources)', { sources })
        .andWhere('orders.userId IS NOT NULL');

      if (orderType) {
        dbQuery.andWhere('orders.orderType = :orderType', { orderType });
      }

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
              })
              .orWhere('kits.kitId LIKE :searchQuery', {
                searchQuery: `%${searchQuery}%`,
              });
          }),
        );
      }

      if (status) {
        dbQuery.andWhere('orders.status = :status', { status });
      }

      const [
        response,
        totalCount,
        counts,
        monthlyTotal,
        currencyTotalsFromOrders,
      ] = await Promise.all([
        dbQuery
          .take(take)
          .skip(skip)
          .orderBy('orders.createdAt', sort)
          .getManyAndCount(),

        // Total count — mirrors structural filters (no search/pagination/status)
        (async () => {
          const qb = this.orderRepo
            .createQueryBuilder('orders')
            .where('orders.userId IS NOT NULL')
            .andWhere('orders.source IN (:...sources)', { sources });

          if (orderType) {
            qb.andWhere('orders.orderType = :orderType', { orderType });
          }

          return qb.getCount();
        })(),

        // Bucket counts by status — mirrors structural filters (no search/pagination)
        (async () => {
          const qb = this.orderRepo
            .createQueryBuilder('orders')
            .select(['orders.status AS status', 'COUNT(orders.id) AS count'])
            .where('orders.userId IS NOT NULL')
            .andWhere('orders.source IN (:...sources)', { sources });

          if (orderType) {
            qb.andWhere('orders.orderType = :orderType', { orderType });
          }

          qb.groupBy('orders.status');
          return qb.getRawMany<{ status: string; count: string }>();
        })(),

        // Monthly total — count of orders created in [26th last month, 25th this month] ET
        (async () => {
          const qb = this.orderRepo
            .createQueryBuilder('orders')
            .where('orders.userId IS NOT NULL')
            .andWhere('orders.source IN (:...sources)', { sources })
            .andWhere(
              'orders.createdAt >= :startUtc AND orders.createdAt <= :endUtc',
              {
                startUtc,
                endUtc,
              },
            );

          if (orderType) {
            qb.andWhere('orders.orderType = :orderType', { orderType });
          }

          return qb.getCount();
        })(),

        this.getCurrencyTotalsFromOrderItems(startUtc, endUtc, orderType),
      ]);

      const [Orders, total] = response;

      const pageMetaDto = new PageMetaDto({
        itemCount: total,
        pageOptionsDto,
      });

      const result = Orders.map((order) => new OrderDto().fromEntity(order));

      return {
        result,
        totalCount,
        counts,
        monthlyTotal,
        currencyTotalsFromOrders,
        pageMetaDto,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  private async getCurrencyTotalsFromOrderItems(
    startUtc: Date,
    endUtc: Date,
    orderType?: OrderType,
    userId?: string,
  ): Promise<{ currency: string; amount: number; subAmount: number }[]> {
    const sources = [Source.Platform, Source.Elyxium];

    const qb = this.orderRepo
      .createQueryBuilder('orders')
      .leftJoin(PaymentStatementItem, 'psi', 'psi.orderId = orders.id')
      .select([
        'psi.currency AS currency',
        'SUM(psi.unitAmount * COALESCE(psi.quantity, 1)) AS subAmount', // minor
        '(SUM(psi.unitAmount * COALESCE(psi.quantity, 1)) / 100.0) AS amount', // major
      ])
      .where('orders.userId IS NOT NULL')
      .andWhere('orders.source IN (:...sources)', { sources })
      .andWhere(
        'orders.createdAt >= :startUtc AND orders.createdAt <= :endUtc',
        {
          startUtc,
          endUtc,
        },
      )
      .andWhere('psi.currency IS NOT NULL')
      .andWhere('psi.unitAmount IS NOT NULL');

    if (orderType) {
      qb.andWhere('orders.orderType = :orderType', { orderType });
    }

    if (userId) {
      qb.andWhere('orders.userId = :userId', { userId });
    }

    const rows = await qb
      .groupBy('psi.currency')
      .getRawMany<{ currency: string; subAmount: string; amount: string }>();

    return rows.map((r) => ({
      currency: r.currency,
      amount: Number.parseFloat(r.amount) || 0,
      subAmount: Number.parseFloat(r.subAmount) || 0,
    }));
  }
}
