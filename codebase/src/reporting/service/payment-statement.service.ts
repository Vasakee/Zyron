import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { PaymentStatement } from 'src/payment/entity/payment-statement.entity';
import { PaymentStatementItem } from 'src/payment/entity/payment-statement-item.entity';
import {
  PaymentStatementQueryDto,
  PaymentStatementStatisticsDto,
  PaymentStatementIntervalBreakdownDto,
} from '../dto/reporting.dto';
import { PageOptionsDto, PageMetaDto } from 'src/common';
import { PaymentStatementStatus } from 'src/enum';
import {
  formatCurrencyAmount,
  groupByCurrency,
  getTotalAmount,
} from './payment-statement-statistics.helper';

@Injectable()
export class PaymentStatementService {
  private readonly logger = new Logger(PaymentStatementService.name);

  constructor(
    @InjectRepository(PaymentStatement)
    private readonly paymentStatementRepository: Repository<PaymentStatement>,
  ) {}

  async getPaymentStatements(
    pageOptionsDto: PageOptionsDto,
    query: PaymentStatementQueryDto,
  ) {
    try {
      const { take, skip } = pageOptionsDto;
      const {
        userId,
        status,
        paidAtStart,
        paidAtEnd,
        createdAtStart,
        createdAtEnd,
        interval,
        limit,
      } = query;

      const dbQuery: SelectQueryBuilder<PaymentStatement> =
        this.paymentStatementRepository
          .createQueryBuilder('statement')
          .leftJoinAndSelect('statement.user', 'user')
          .leftJoin(
            PaymentStatementItem,
            'item',
            'item.paymentStatementId = statement.id',
          )
          .select([
            'statement.id',
            'statement.interval',
            'statement.currency',
            'statement.periodStart',
            'statement.periodEnd',
            'statement.stripeInvoiceId',
            'statement.status',
            'statement.amountSubtotal',
            'statement.amountDiscount',
            'statement.amountTax',
            'statement.amountTotal',
            'statement.paidAt',
            'statement.createdAt',
            'user.id',
            'user.firstName',
            'user.lastName',
            'user.email',
            'COUNT(item.id) as orderCount',
          ])
          .where('1=1');

      if (userId) {
        dbQuery.andWhere('statement.userId = :userId', { userId });
      }

      // Filter by status
      if (status) {
        dbQuery.andWhere('statement.status = :status', { status });
      }

      // Filter by paidAt date range
      if (paidAtStart) {
        dbQuery.andWhere('statement.paidAt >= :paidAtStart', { paidAtStart });
      }

      if (paidAtEnd) {
        dbQuery.andWhere('statement.paidAt <= :paidAtEnd', { paidAtEnd });
      }

      // Filter by createdAt date range
      if (createdAtStart) {
        dbQuery.andWhere('statement.createdAt >= :createdAtStart', {
          createdAtStart,
        });
      }

      if (createdAtEnd) {
        dbQuery.andWhere('statement.createdAt <= :createdAtEnd', {
          createdAtEnd,
        });
      }

      // Filter by interval
      if (interval) {
        dbQuery.andWhere('statement.interval = :interval', { interval });
      }

      let finalQuery = dbQuery
        .groupBy('statement.id')
        .addGroupBy('user.id')
        .addGroupBy('user.firstName')
        .addGroupBy('user.lastName')
        .addGroupBy('user.email')
        .orderBy('statement.createdAt', 'DESC');

      if (limit) {
        finalQuery = finalQuery.limit(limit);
      } else {
        finalQuery = finalQuery.take(take).skip(skip);
      }

      const statements = await finalQuery.getRawMany();

      const countQuery = this.paymentStatementRepository
        .createQueryBuilder('statement')
        .where('1=1');

      if (userId) {
        countQuery.andWhere('statement.userId = :userId', { userId });
      }

      if (status) {
        countQuery.andWhere('statement.status = :status', { status });
      }

      if (paidAtStart) {
        countQuery.andWhere('statement.paidAt >= :paidAtStart', {
          paidAtStart,
        });
      }

      if (paidAtEnd) {
        countQuery.andWhere('statement.paidAt <= :paidAtEnd', {
          paidAtEnd,
        });
      }

      if (createdAtStart) {
        countQuery.andWhere('statement.createdAt >= :createdAtStart', {
          createdAtStart,
        });
      }

      if (createdAtEnd) {
        countQuery.andWhere('statement.createdAt <= :createdAtEnd', {
          createdAtEnd,
        });
      }

      if (interval) {
        countQuery.andWhere('statement.interval = :interval', {
          interval,
        });
      }

      const total = await countQuery.getCount();

      const pageMetaDto = new PageMetaDto({
        itemCount: total,
        pageOptionsDto,
      });

      const result = statements.map((statement) => ({
        id: statement.statement_id,
        practitionerId: statement.user_id,
        practitionerName: `${statement.user_firstName} ${statement.user_lastName}`,
        practitionerEmail: statement.user_email,
        interval: statement.statement_interval,
        currency: statement.statement_currency,
        periodStart: statement.statement_periodStart,
        periodEnd: statement.statement_periodEnd,
        stripeInvoiceId: statement.statement_stripeInvoiceId,
        status: statement.statement_status,
        amountSubtotal: statement.statement_amountSubtotal,
        amountDiscount: statement.statement_amountDiscount,
        amountTax: statement.statement_amountTax,
        amountTotal: statement.statement_amountTotal,
        paidAt: statement.statement_paidAt,
        orderCount: parseInt(statement.orderCount) || 0,
        createdAt: statement.statement_createdAt,
      }));

      return { result, pageMetaDto };
    } catch (error) {
      this.logger.error(`Error fetching payment statements:`, error);
      throw error;
    }
  }

  async getPaymentStatementSummary(query: PaymentStatementQueryDto) {
    try {
      const {
        userId,
        status,
        paidAtStart,
        paidAtEnd,
        createdAtStart,
        createdAtEnd,
        interval,
      } = query;

      const dbQuery = this.paymentStatementRepository
        .createQueryBuilder('statement')
        .leftJoin(
          PaymentStatementItem,
          'item',
          'item.paymentStatementId = statement.id',
        )
        .select([
          'item.currency as currency',
          'statement.status as status',
          'statement.interval as interval',
          'COUNT(DISTINCT statement.id) as statementCount',
          'SUM(item.unitAmount * item.quantity) as totalAmount',
          "SUM(CASE WHEN statement.status = 'paid' THEN item.unitAmount * item.quantity ELSE 0 END) as paidAmount",
          "SUM(CASE WHEN statement.status = 'payment_failed' THEN item.unitAmount * item.quantity ELSE 0 END) as failedAmount",
        ])
        .where('1=1')
        .andWhere('item.id IS NOT NULL');

      if (userId) {
        dbQuery.andWhere('statement.userId = :userId', { userId });
      }

      // Apply filters
      if (status) {
        dbQuery.andWhere('statement.status = :status', { status });
      }

      if (paidAtStart) {
        dbQuery.andWhere('statement.paidAt >= :paidAtStart', { paidAtStart });
      }

      if (paidAtEnd) {
        dbQuery.andWhere('statement.paidAt <= :paidAtEnd', { paidAtEnd });
      }

      if (createdAtStart) {
        dbQuery.andWhere('statement.createdAt >= :createdAtStart', {
          createdAtStart,
        });
      }

      if (createdAtEnd) {
        dbQuery.andWhere('statement.createdAt <= :createdAtEnd', {
          createdAtEnd,
        });
      }

      if (interval) {
        dbQuery.andWhere('statement.interval = :interval', { interval });
      }

      const summary = await dbQuery
        .groupBy('item.currency')
        .addGroupBy('statement.status')
        .addGroupBy('statement.interval')
        .orderBy('totalAmount', 'DESC')
        .getRawMany();

      return summary;
    } catch (error) {
      this.logger.error(`Error fetching payment statement summary:`, error);
      throw error;
    }
  }

  async getPaymentStatementStatusSummary(query: PaymentStatementQueryDto) {
    try {
      const {
        userId,
        status,
        paidAtStart,
        paidAtEnd,
        createdAtStart,
        createdAtEnd,
        interval,
      } = query;

      const dbQuery = this.paymentStatementRepository
        .createQueryBuilder('statement')
        .leftJoin(
          PaymentStatementItem,
          'item',
          'item.paymentStatementId = statement.id',
        )
        .select([
          'statement.status as status',
          'COUNT(DISTINCT statement.id) as count',
          'SUM(item.unitAmount * item.quantity) as totalAmount',
        ])
        .where('1=1')
        .andWhere('item.id IS NOT NULL');

      if (userId) {
        dbQuery.andWhere('statement.userId = :userId', { userId });
      }

      if (status) {
        dbQuery.andWhere('statement.status = :status', { status });
      }

      if (paidAtStart) {
        dbQuery.andWhere('statement.paidAt >= :paidAtStart', { paidAtStart });
      }

      if (paidAtEnd) {
        dbQuery.andWhere('statement.paidAt <= :paidAtEnd', { paidAtEnd });
      }

      if (createdAtStart) {
        dbQuery.andWhere('statement.createdAt >= :createdAtStart', {
          createdAtStart,
        });
      }

      if (createdAtEnd) {
        dbQuery.andWhere('statement.createdAt <= :createdAtEnd', {
          createdAtEnd,
        });
      }

      if (interval) {
        dbQuery.andWhere('statement.interval = :interval', { interval });
      }

      const statusSummary = await dbQuery
        .groupBy('statement.status')
        .orderBy('totalAmount', 'DESC')
        .getRawMany();

      return statusSummary.map((item) => ({
        status: item.status,
        count: parseInt(item.count) || 0,
        totalAmount: parseFloat(item.totalAmount) || 0,
      }));
    } catch (error) {
      this.logger.error(
        `Error fetching payment statement status summary:`,
        error,
      );
      throw error;
    }
  }

  async getPaymentStatementStatistics(
    query: PaymentStatementQueryDto,
  ): Promise<PaymentStatementStatisticsDto> {
    try {
      const {
        userId,
        status,
        paidAtStart,
        paidAtEnd,
        createdAtStart,
        createdAtEnd,
        interval,
      } = query;

      // Build base query with filters
      const buildBaseQuery = () => {
        const baseQuery = this.paymentStatementRepository
          .createQueryBuilder('statement')
          .where('1=1');

        if (userId) {
          baseQuery.andWhere('statement.userId = :userId', { userId });
        }

        if (status) {
          baseQuery.andWhere('statement.status = :status', { status });
        }

        if (paidAtStart) {
          baseQuery.andWhere('statement.paidAt >= :paidAtStart', {
            paidAtStart,
          });
        }

        if (paidAtEnd) {
          baseQuery.andWhere('statement.paidAt <= :paidAtEnd', { paidAtEnd });
        }

        if (createdAtStart) {
          baseQuery.andWhere('statement.createdAt >= :createdAtStart', {
            createdAtStart,
          });
        }

        if (createdAtEnd) {
          baseQuery.andWhere('statement.createdAt <= :createdAtEnd', {
            createdAtEnd,
          });
        }

        if (interval) {
          baseQuery.andWhere('statement.interval = :interval', { interval });
        }

        return baseQuery;
      };

      // 1. Overall statistics by currency
      const overallStatsByCurrency = await buildBaseQuery()
        .leftJoin(
          PaymentStatementItem,
          'item',
          'item.paymentStatementId = statement.id',
        )
        .select([
          'COUNT(DISTINCT statement.id) as totalStatements',
          'item.currency as currency',
          'COALESCE(SUM(CAST(item.unitAmount AS BIGINT) * CAST(item.quantity AS BIGINT)), 0) as totalAmount',
          "COALESCE(SUM(CASE WHEN statement.status = 'paid' THEN CAST(item.unitAmount AS BIGINT) * CAST(item.quantity AS BIGINT) ELSE 0 END), 0) as totalPaid",
          "COALESCE(SUM(CASE WHEN statement.status = 'payment_failed' THEN CAST(item.unitAmount AS BIGINT) * CAST(item.quantity AS BIGINT) ELSE 0 END), 0) as totalFailed",
          "COALESCE(SUM(CASE WHEN statement.status IN ('open', 'finalized', 'processing') THEN CAST(item.unitAmount AS BIGINT) * CAST(item.quantity AS BIGINT) ELSE 0 END), 0) as totalPending",
          'MIN(statement.createdAt) as minDate',
          'MAX(statement.createdAt) as maxDate',
        ])
        .groupBy('item.currency')
        .getRawMany();

      const totalStatements =
        parseInt(overallStatsByCurrency[0]?.totalStatements) || 0;

      const totalAmounts = groupByCurrency(
        overallStatsByCurrency,
        'currency',
        'totalAmount',
      );
      const totalPaid = groupByCurrency(
        overallStatsByCurrency,
        'currency',
        'totalPaid',
      );
      const totalFailed = groupByCurrency(
        overallStatsByCurrency,
        'currency',
        'totalFailed',
      );
      const totalPending = groupByCurrency(
        overallStatsByCurrency,
        'currency',
        'totalPending',
      );

      const totalAmountAllCurrencies = getTotalAmount(totalAmounts);
      const totalPaidAllCurrencies = getTotalAmount(totalPaid);
      const totalFailedAllCurrencies = getTotalAmount(totalFailed);

      const paidPercentage =
        totalAmountAllCurrencies > 0
          ? (totalPaidAllCurrencies / totalAmountAllCurrencies) * 100
          : 0;
      const failureRate =
        totalAmountAllCurrencies > 0
          ? (totalFailedAllCurrencies / totalAmountAllCurrencies) * 100
          : 0;

      const dateRange = {
        start: overallStatsByCurrency[0]?.minDate || new Date(),
        end: overallStatsByCurrency[0]?.maxDate || new Date(),
      };

      // 2. Status breakdown by currency
      const statusBreakdownRaw = await buildBaseQuery()
        .leftJoin(
          PaymentStatementItem,
          'item',
          'item.paymentStatementId = statement.id',
        )
        .select([
          'statement.status as status',
          'item.currency as currency',
          'COUNT(DISTINCT statement.id) as count',
          'COALESCE(SUM(CAST(item.unitAmount AS BIGINT) * CAST(item.quantity AS BIGINT)), 0) as amount',
        ])
        .groupBy('statement.status')
        .addGroupBy('item.currency')
        .getRawMany();

      // Group by status and aggregate currencies
      const statusBreakdownMap = statusBreakdownRaw.reduce((acc, item) => {
        if (!acc[item.status]) {
          acc[item.status] = {
            status: item.status,
            count: 0,
            amounts: [],
          };
        }
        acc[item.status].count = parseInt(item.count) || 0;
        acc[item.status].amounts.push({
          currency: item.currency,
          ...formatCurrencyAmount(parseInt(item.amount) || 0),
        });
        return acc;
      }, {} as Record<string, any>);

      const formattedStatusBreakdown = Object.values(statusBreakdownMap).map(
        (item: any) => {
          const statusTotal = getTotalAmount(item.amounts);
          return {
            status: item.status,
            count: item.count,
            amounts: item.amounts,
            percentage:
              totalAmountAllCurrencies > 0
                ? (statusTotal / totalAmountAllCurrencies) * 100
                : 0,
          };
        },
      );

      // 3. Currency breakdown
      const currencyBreakdown = await buildBaseQuery()
        .leftJoin(
          PaymentStatementItem,
          'item',
          'item.paymentStatementId = statement.id',
        )
        .select([
          'item.currency as currency',
          'COUNT(DISTINCT statement.id) as count',
          'COALESCE(SUM(CAST(item.unitAmount AS BIGINT) * CAST(item.quantity AS BIGINT)), 0) as amount',
        ])
        .groupBy('item.currency')
        .orderBy('amount', 'DESC')
        .getRawMany();

      const formattedCurrencyBreakdown = currencyBreakdown.map((item) => ({
        currency: item.currency,
        count: parseInt(item.count) || 0,
        ...formatCurrencyAmount(parseInt(item.amount) || 0),
      }));

      // 4. Interval breakdown by currency
      const intervalBreakdownRaw = await buildBaseQuery()
        .leftJoin(
          PaymentStatementItem,
          'item',
          'item.paymentStatementId = statement.id',
        )
        .select([
          'statement.interval as interval',
          'item.currency as currency',
          'COUNT(DISTINCT statement.id) as count',
          'COALESCE(SUM(CAST(item.unitAmount AS BIGINT) * CAST(item.quantity AS BIGINT)), 0) as amount',
        ])
        .groupBy('statement.interval')
        .addGroupBy('item.currency')
        .getRawMany();

      // Group by interval and aggregate currencies
      const intervalBreakdownMap = intervalBreakdownRaw.reduce(
        (acc, item) => {
          if (!acc[item.interval]) {
            acc[item.interval] = {
              interval: item.interval,
              count: 0,
              amounts: [],
            };
          }
          acc[item.interval].count = parseInt(item.count) || 0;
          acc[item.interval].amounts.push({
            currency: item.currency,
            ...formatCurrencyAmount(parseInt(item.amount) || 0),
          });
          return acc;
        },
        {} as Record<
          string,
          {
            interval: string;
            count: number;
            amounts: Array<{
              currency: string;
              amountInCents: number;
              actualAmount: number;
            }>;
          }
        >,
      );

      const formattedIntervalBreakdown: PaymentStatementIntervalBreakdownDto[] =
        Object.values(intervalBreakdownMap);

      // 5. Averages and medians by currency
      const itemCountStats = await buildBaseQuery()
        .leftJoin(
          PaymentStatementItem,
          'item',
          'item.paymentStatementId = statement.id',
        )
        .select(['statement.id as statementId', 'COUNT(item.id) as itemCount'])
        .groupBy('statement.id')
        .getRawMany();

      const itemCounts = itemCountStats.map((s) => parseInt(s.itemCount) || 0);
      const averageItemCount =
        itemCounts.length > 0
          ? itemCounts.reduce((a, b) => a + b, 0) / itemCounts.length
          : 0;

      // Calculate amounts per statement by currency
      const statementAmountsByCurrency = await buildBaseQuery()
        .leftJoin(
          PaymentStatementItem,
          'item',
          'item.paymentStatementId = statement.id',
        )
        .select([
          'statement.id as statementId',
          'item.currency as currency',
          'COALESCE(SUM(CAST(item.unitAmount AS BIGINT) * CAST(item.quantity AS BIGINT)), 0) as amount',
        ])
        .groupBy('statement.id')
        .addGroupBy('item.currency')
        .getRawMany();

      // Group by currency for averages and medians
      const currencyGroups = statementAmountsByCurrency.reduce((acc, item) => {
        if (!acc[item.currency]) {
          acc[item.currency] = [];
        }
        acc[item.currency].push(parseInt(item.amount) || 0);
        return acc;
      }, {} as Record<string, number[]>);

      const averageAmounts = Object.entries(currencyGroups).map(
        ([currency, amounts]: [string, number[]]) => {
          const sorted = [...amounts].sort((a: number, b: number) => a - b);
          const avg =
            sorted.length > 0
              ? sorted.reduce((a: number, b: number) => a + b, 0) /
                sorted.length
              : 0;
          return {
            currency,
            ...formatCurrencyAmount(Math.round(avg)),
          };
        },
      );

      const medianAmounts = Object.entries(currencyGroups).map(
        ([currency, amounts]: [string, number[]]) => {
          const sorted = [...amounts].sort((a: number, b: number) => a - b);
          const median =
            sorted.length > 0
              ? sorted.length % 2 === 0
                ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) /
                  2
                : sorted[Math.floor(sorted.length / 2)]
              : 0;
          return {
            currency,
            ...formatCurrencyAmount(Math.round(median)),
          };
        },
      );

      const attemptStats = await buildBaseQuery()
        .select('AVG(CAST(statement.attemptCount AS FLOAT)) as avgAttemptCount')
        .getRawOne();

      const averageAttemptCount = parseFloat(attemptStats.avgAttemptCount) || 0;

      // 7. Retry metrics
      const retryMetrics = await buildBaseQuery()
        .select([
          'COUNT(statement.id) as totalStatements',
          'SUM(CASE WHEN statement.attemptCount > 0 THEN 1 ELSE 0 END) as statementsWithRetries',
          'AVG(CAST(statement.attemptCount AS FLOAT)) as averageRetryCount',
          'MAX(statement.attemptCount) as maxRetryCount',
        ])
        .getRawOne();

      const totalStatementsForRetry =
        parseInt(retryMetrics.totalStatements) || 0;
      const statementsWithRetries =
        parseInt(retryMetrics.statementsWithRetries) || 0;
      const retryRate =
        totalStatementsForRetry > 0
          ? (statementsWithRetries / totalStatementsForRetry) * 100
          : 0;

      const formattedRetryMetrics = {
        totalStatements: totalStatementsForRetry,
        statementsWithRetries,
        retryRate,
        averageRetryCount: parseFloat(retryMetrics.averageRetryCount) || 0,
        maxRetryCount: parseInt(retryMetrics.maxRetryCount) || 0,
      };

      return {
        totalStatements,
        totalAmounts,
        totalPaid,
        totalFailed,
        totalPending,
        paidPercentage,
        failureRate,
        statusBreakdown: formattedStatusBreakdown,
        currencyBreakdown: formattedCurrencyBreakdown,
        intervalBreakdown: formattedIntervalBreakdown,
        averages: {
          averageAmounts,
          medianAmounts,
          averageItemCount,
          averageAttemptCount,
        },
        retryMetrics: formattedRetryMetrics,
        dateRange,
      };
    } catch (error) {
      this.logger.error(`Error fetching payment statement statistics:`, error);
      throw error;
    }
  }
}
