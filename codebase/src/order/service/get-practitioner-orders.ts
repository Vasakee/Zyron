import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { Order } from '../entity/order.entity';
import { OrderDto, OrdersQueryDto } from '../dto/create-order.dto';
import { PageMetaDto, PageOptionsDto } from 'src/common';
import { OrderStatus, Source, OrderType } from 'src/enum';
import { DateTime } from 'luxon';
import { getCurrentBillingWindowWithLabelFromNYToUTC } from 'src/common/utils/manager-calender';
import { BILLING_PERIOD_START_DAY, SYSTEM_TIME_ZONE } from 'src/config';

@Injectable()
export class GetPractitionerOrderService {
  private readonly logger = new Logger(GetPractitionerOrderService.name);

  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
  ) {}

  async execute(
    userId: string,
    pageOptionsDto: PageOptionsDto,
    query: OrdersQueryDto,
    orderType: OrderType,
  ) {
    try {
      if (!orderType) {
        throw new Error('Order type is required');
      }

      const { take, skip } = pageOptionsDto;
      const { searchQuery, status } = query;
      const sort: 'ASC' | 'DESC' = 'DESC';

      const {
        startUTC: startUtc,
        endUTC: endUtc,
        label,
      } = getCurrentBillingWindowWithLabelFromNYToUTC();

      const sources = [Source.Platform, Source.Waitlist, Source.Elyxium];
      const excludedStatuses = [OrderStatus.Pending, OrderStatus.Cancelled];

      // Base list query
      const dbQuery: SelectQueryBuilder<Order> = this.orderRepo
        .createQueryBuilder('orders')
        .leftJoinAndSelect('orders.orderKits', 'kits')
        .leftJoinAndSelect('orders.user', 'user')
        .leftJoinAndSelect(
          'orders.paymentStatementItem',
          'paymentStatementItem',
        )
        .where('orders.userId = :userId', { userId })
        .andWhere('orders.source IN (:...sources)', { sources })
        .andWhere('orders.status NOT IN (:...excludedStatuses)', {
          excludedStatuses,
        })
        .andWhere('orders.orderType = :orderType', { orderType });

      if (searchQuery) {
        dbQuery.andWhere(
          new Brackets((qb) => {
            qb.where('orders.firstName LIKE :search', {
              search: `%${searchQuery}%`,
            })
              .orWhere('orders.lastName LIKE :search', {
                search: `%${searchQuery}%`,
              })
              .orWhere('kits.kitId LIKE :search', {
                search: `%${searchQuery}%`,
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
        monthlyTotalRow,
        currencyTotalsFromOrders,
      ] = await Promise.all([
        // existing list query with filters/pagination
        dbQuery
          .take(take)
          .skip(skip)
          .orderBy('orders.createdAt', sort)
          .getManyAndCount(),

        // existing counts (filtered)
        this.orderRepo
          .createQueryBuilder('orders')
          .where('orders.userId = :userId', { userId })
          .andWhere('orders.source IN (:...sources)', { sources })
          .andWhere('orders.status NOT IN (:...excludedStatuses)', {
            excludedStatuses,
          })
          .andWhere('orders.orderType = :orderType', { orderType })
          .getCount(),

        // existing status buckets (filtered)
        this.orderRepo
          .createQueryBuilder('orders')
          .select(['orders.status AS status', 'COUNT(orders.id) AS count'])
          .where('orders.userId = :userId', { userId })
          .andWhere('orders.source IN (:...sources)', { sources })
          .andWhere('orders.status NOT IN (:...excludedStatuses)', {
            excludedStatuses,
          })
          .andWhere('orders.orderType = :orderType', { orderType })
          .groupBy('orders.status')
          .getRawMany<{ status: OrderStatus; count: string }>(),

        // existing monthlyTotal (filtered)
        this.orderRepo
          .createQueryBuilder('orders')
          .where('orders.userId = :userId', { userId })
          .andWhere('orders.source IN (:...sources)', { sources })
          .andWhere('orders.status NOT IN (:...excludedStatuses)', {
            excludedStatuses,
          })
          .andWhere('orders.orderType = :orderType', { orderType })
          .andWhere(
            `
              EXISTS (
                SELECT 1
                FROM payment_statement_items psi
                JOIN payment_statements ps
                  ON ps.id = psi.paymentStatementId
                WHERE psi.orderId = orders.id
                  AND ps.periodStart = :startUtc
              )
            `,
            { startUtc },
          )
          .select('COUNT(DISTINCT orders.id)', 'cnt')
          .getRawOne<{ cnt: string | number }>(),

        this.getCurrencyTotalsFromOrderItems(
          orderType,
          startUtc,
          endUtc,
          userId,
        ),
      ]);

      const [Orders, total] = response;
      const pageMetaDto = new PageMetaDto({ itemCount: total, pageOptionsDto });
      const result = Orders.map((order) => new OrderDto().fromEntity(order));
      const monthlyTotal = Number(monthlyTotalRow?.cnt ?? 0);

      return {
        result,
        totalCount,
        counts,
        monthlyTotal,
        currencyTotalsFromOrders,
        label,
        pageMetaDto,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  private async getCurrencyTotalsFromOrderItems(
    orderType: OrderType,
    startUtc: Date,
    endUtc: Date,
    userId?: string,
    sources?: Source[],
    excludedStatuses?: OrderStatus[],
  ): Promise<{ currency: string; amount: number; subAmount: number }[]> {
    const qb = this.orderRepo
      .createQueryBuilder('orders')
      .innerJoin('payment_statement_items', 'psi', 'psi.orderId = orders.id')
      .innerJoin('payment_statements', 'ps', 'ps.id = psi.paymentStatementId')
      .select([
        'psi.currency AS currency',
        'SUM(psi.unitAmount * COALESCE(psi.quantity, 1)) AS subAmount',
        '(SUM(psi.unitAmount * COALESCE(psi.quantity, 1)) / 100.0) AS amount',
      ])
      .where('orders.orderType = :orderType', { orderType })
      .andWhere('ps.periodStart = :startUtc', {
        startUtc,
      })
      .andWhere('psi.currency IS NOT NULL')
      .andWhere('psi.unitAmount IS NOT NULL');

    if (userId) qb.andWhere('orders.userId = :userId', { userId });
    if (sources?.length)
      qb.andWhere('orders.source IN (:...sources)', { sources });
    if (excludedStatuses?.length)
      qb.andWhere('orders.status NOT IN (:...excludedStatuses)', {
        excludedStatuses,
      });

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
