import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { PaymentStatement } from 'src/payment/entity/payment-statement.entity';
import { PaymentStatementItem } from 'src/payment/entity/payment-statement-item.entity';
import {
  StatementReportDto,
  MonthlyStatementQueryDto,
  MonthlyStatementDto,
  StatementItemDto,
  MonthlyStatementWithStatsDto,
  CurrencyTotalDto,
} from '../dto/reporting.dto';
import { PageOptionsDto, PageMetaDto } from 'src/common';
import { DateTime } from 'luxon';
import { PaymentStatementQueryStatus, PaymentStatementStatus } from 'src/enum';
import {
  Bucket,
  getCurrentBillingWindowWithLabelFromNYToUTC,
} from 'src/common/utils/manager-calender';
import { SYSTEM_TIME_ZONE } from 'src/config';

type CurrencyBucket = { currency: string; amount: number; subAmount: number };

@Injectable()
export class StatementReportingService {
  private readonly logger = new Logger(StatementReportingService.name);

  constructor(
    @InjectRepository(PaymentStatement)
    private readonly paymentStatementRepository: Repository<PaymentStatement>,
    @InjectRepository(PaymentStatementItem)
    private readonly paymentStatementItemRepository: Repository<PaymentStatementItem>,
  ) {}

  private applyMonthYearFilters(
    qb: SelectQueryBuilder<PaymentStatement>,
    filters: { year?: number; month?: number },
  ) {
    const { year, month } = filters;
    if (year)
      qb.andWhere('DATEPART(year, statement.periodStart) = :year', { year });
    if (month)
      qb.andWhere('DATEPART(month, statement.periodStart) = :month', { month });
    return qb;
  }

  private makePageMeta(total: number, pageOptionsDto: PageOptionsDto) {
    return new PageMetaDto({ itemCount: total, pageOptionsDto });
  }

  private computeLabel(periodStart: Date, periodEnd: Date) {
    const labelNY = DateTime.fromJSDate(periodEnd)
      .setZone(SYSTEM_TIME_ZONE || 'America/New_York')
      .minus({ days: 1 });
    return { labelYear: labelNY.year, labelMonth: labelNY.month };
  }

  private currencyTotalsFromItems(
    items: PaymentStatementItem[],
  ): CurrencyBucket[] {
    return items.reduce((acc, item) => {
      const sub = item.unitAmount * item.quantity;
      const found = acc.find((c) => c.currency === item.currency);
      if (found) {
        found.subAmount += sub;
        found.amount += sub / 100;
      } else {
        acc.push({
          currency: item.currency,
          subAmount: sub,
          amount: sub / 100,
        });
      }
      return acc;
    }, [] as CurrencyBucket[]);
  }

  private mapStatementToDto(statement: PaymentStatement): MonthlyStatementDto {
    const currencyTotals = this.currencyTotalsFromItems(statement.items);
    const items: StatementItemDto[] = statement.items.map((it) => ({
      id: it.id,
      orderId: it.orderId,
      description: it.description,
      quantity: it.quantity,
      unitAmount: it.unitAmount,
      currency: it.currency,
      clientName: it.clientName,
      clientEmail: it.clientEmail,
    }));
    const { labelYear, labelMonth } = this.computeLabel(
      statement.periodStart,
      statement.periodEnd,
    );
    return {
      id: statement.id,
      practitionerId: statement.userId,
      interval: statement.interval,
      periodStart: statement.periodStart,
      periodEnd: statement.periodEnd,
      invoiceId: statement.invoiceId ?? null,
      invoiceNumber: statement.invoiceNumber ?? null,
      invoiceUrl: statement.invoiceUrl ?? null,
      invoicePdf: statement.invoicePdf ?? null,
      status: statement.status as PaymentStatementStatus,
      invoiceStatus: (statement.invoiceStatus as any) ?? null,
      paidAt: statement.paidAt ?? null,
      statementItems: items,
      currencyTotals: currencyTotals as CurrencyTotalDto[],
      createdAt: statement.createdAt,
      labelYear,
      labelMonth,
      currency: null,
    };
  }

  private async calculateCurrentMonthStatistics(
    includeInvoiceFilter: boolean,
    userId?: string,
    isPractitionerView = false,
  ) {
    const { startUTC, endUTC, label } =
      getCurrentBillingWindowWithLabelFromNYToUTC();

    // ----- counts (no joins → no fan-out) -----
    const countsQB = this.paymentStatementRepository
      .createQueryBuilder('statement')
      .where('statement.userId IS NOT NULL')
      .andWhere('statement.periodStart <= :endUTC', { endUTC })
      .andWhere('statement.periodEnd >= :startUTC', { startUTC });

    if (isPractitionerView && userId)
      countsQB.andWhere('statement.userId = :userId', { userId });
    if (includeInvoiceFilter)
      countsQB.andWhere('statement.invoiceId IS NOT NULL');

    const countsRow = await countsQB
      .select([
        'COUNT(DISTINCT statement.id) AS allCount',
        'COUNT(DISTINCT CASE WHEN statement.status = :paid THEN statement.id END) AS paidCount',
        'COUNT(DISTINCT CASE WHEN statement.status <> :paid THEN statement.id END) AS unpaidCount',
      ])
      .setParameters({ paid: PaymentStatementStatus.Paid })
      .getRawOne<{
        allCount: string | number;
        paidCount: string | number;
        unpaidCount: string | number;
      }>();

    const counts = {
      all: Number(countsRow?.allCount ?? 0),
      paid: Number(countsRow?.paidCount ?? 0),
      unpaid: Number(countsRow?.unpaidCount ?? 0),
    };

    const bucketQB = this.paymentStatementRepository
      .createQueryBuilder('statement')
      .leftJoin('statement.items', 'items')
      .where('statement.userId IS NOT NULL')
      .andWhere('statement.periodStart <= :endUTC', { endUTC })
      .andWhere('statement.periodEnd >= :startUTC', { startUTC })
      .andWhere('items.id IS NOT NULL');

    if (isPractitionerView && userId)
      bucketQB.andWhere('statement.userId = :userId', { userId });
    if (includeInvoiceFilter)
      bucketQB.andWhere('statement.invoiceId IS NOT NULL');

    const selectCols = [
      'items.currency as currency',
      'SUM(items.unitAmount * items.quantity) as subAmount',
      'SUM(items.unitAmount * items.quantity) / 100.0 as amount',
    ];

    const [allRows, paidRows, unpaidRows] = await Promise.all([
      bucketQB
        .clone()
        .select(selectCols)
        .groupBy('items.currency')
        .getRawMany(),
      bucketQB
        .clone()
        .andWhere('statement.status = :paid', {
          paid: PaymentStatementStatus.Paid,
        })
        .select(selectCols)
        .groupBy('items.currency')
        .getRawMany(),
      bucketQB
        .clone()
        .andWhere('statement.status <> :paid', {
          paid: PaymentStatementStatus.Paid,
        })
        .select(selectCols)
        .groupBy('items.currency')
        .getRawMany(),
    ]);

    const toBuckets = (rows: any[]): Bucket[] =>
      rows.map((r) => ({
        currency: r.currency,
        amount: Number(r.amount) || 0,
        subAmount: Number(r.subAmount) || 0,
      }));

    return {
      label,
      all: { count: counts.all, currencyTotals: toBuckets(allRows) },
      paid: { count: counts.paid, currencyTotals: toBuckets(paidRows) },
      rest: { count: counts.unpaid, currencyTotals: toBuckets(unpaidRows) },
      window: { startUTC, endUTC },
    };
  }

  async getStatementReport(pageOptionsDto: PageOptionsDto) {
    const { take, skip } = pageOptionsDto;

    const baseQB = this.paymentStatementRepository
      .createQueryBuilder('statement')
      .leftJoin('statement.user', 'u')
      .leftJoin(
        PaymentStatementItem,
        'items',
        'items.paymentStatementId = statement.id',
      )
      .where('statement.userId IS NOT NULL');

    const dataQB = baseQB
      .clone()
      .select([
        'statement.id as id',
        'statement.interval as interval',
        'statement.periodStart as periodStart',
        'statement.periodEnd as periodEnd',
        'statement.invoiceId as invoiceId',
        'statement.invoiceNumber as invoiceNumber',
        'statement.status as status',
        'statement.paidAt as paidAt',
        'statement.createdAt as createdAt',
        'u.id as practitionerId',
        'u.firstName as firstName',
        'u.lastName as lastName',
        'u.email as email',
        'COUNT(items.id) as orderCount',
      ])
      .groupBy('statement.id')
      .addGroupBy('u.id')
      .addGroupBy('u.firstName')
      .addGroupBy('u.lastName')
      .addGroupBy('u.email')
      .orderBy('statement.createdAt', 'DESC')
      .take(take)
      .skip(skip);

    const rows = await dataQB.getRawMany();

    const total = Number(
      (
        await baseQB
          .clone()
          .select('COUNT(DISTINCT statement.id)', 'cnt')
          .getRawOne()
      )?.cnt ?? 0,
    );

    const pageMetaDto = this.makePageMeta(total, pageOptionsDto);

    const ids = rows.map((r) => r.id);
    let totalsByStatement: Record<
      string,
      { currency: string; subAmount: number; amount: number }[]
    > = {};

    if (ids.length) {
      const totalsRows = await this.paymentStatementItemRepository
        .createQueryBuilder('it')
        .select([
          'it.paymentStatementId as statementId',
          'it.currency as currency',
          'SUM(it.unitAmount * it.quantity) as subAmount',
        ])
        .where('it.paymentStatementId IN (:...ids)', { ids })
        .groupBy('it.paymentStatementId')
        .addGroupBy('it.currency')
        .getRawMany();

      totalsByStatement = totalsRows.reduce((acc, r) => {
        const list = acc[r.statementId] || [];
        list.push({
          currency: r.currency,
          subAmount: Number(r.subAmount) || 0,
          amount: (Number(r.subAmount) || 0) / 100,
        });
        acc[r.statementId] = list;
        return acc;
      }, {} as Record<string, { currency: string; subAmount: number; amount: number }[]>);
    }

    const result: StatementReportDto[] = rows.map((r) => {
      const label = this.computeLabel(
        new Date(r.periodStart),
        new Date(r.periodEnd),
      );
      return {
        id: r.id,
        practitionerId: r.practitionerId,
        practitionerName: `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim(),
        practitionerEmail: r.email,
        interval: r.interval,
        periodStart: r.periodStart,
        periodEnd: r.periodEnd,
        invoiceId: r.invoiceId ?? null,
        invoiceNumber: r.invoiceNumber ?? null,
        status: r.status,
        amountSubtotal: null,
        amountDiscount: null,
        amountTax: null,
        amountTotal: null,
        paidAt: r.paidAt ?? null,
        orderCount: Number(r.orderCount) || 0,
        createdAt: r.createdAt,
        currencyTotals: (totalsByStatement[r.id] || []) as CurrencyTotalDto[],
        labelYear: label.labelYear,
        labelMonth: label.labelMonth,
        currency: null,
      } as any;
    });

    return { result, pageMetaDto };
  }

  async getStatementRollupByPractitioner() {
    const paid = PaymentStatementStatus.Paid;
    const failed = PaymentStatementStatus.PaymentFailed;

    const qb = this.paymentStatementRepository
      .createQueryBuilder('statement')
      .leftJoin('statement.user', 'u')
      .leftJoin(
        PaymentStatementItem,
        'items',
        'items.paymentStatementId = statement.id',
      )
      .select([
        'u.id as practitionerId',
        'u.firstName as firstName',
        'u.lastName as lastName',
        'u.email as email',
        'items.currency as currency',
        'COUNT(DISTINCT statement.id) as statementCount',
        'COUNT(items.id) as totalOrders',
        'SUM(items.unitAmount * items.quantity) as totalAmount',
        `SUM(CASE WHEN statement.status = :paid THEN items.unitAmount * items.quantity ELSE 0 END) as paidAmount`,
        `SUM(CASE WHEN statement.status = :failed THEN items.unitAmount * items.quantity ELSE 0 END) as failedAmount`,
      ])
      .where('statement.userId IS NOT NULL')
      .andWhere('items.id IS NOT NULL')
      .setParameters({ paid, failed });

    const rows = await qb
      .groupBy('u.id')
      .addGroupBy('u.firstName')
      .addGroupBy('u.lastName')
      .addGroupBy('u.email')
      .addGroupBy('items.currency')
      .orderBy('totalAmount', 'DESC')
      .getRawMany();

    return rows;
  }

  async getStatementRollupByMonth() {
    const paid = PaymentStatementStatus.Paid;
    const failed = PaymentStatementStatus.PaymentFailed;

    const qb = this.paymentStatementRepository
      .createQueryBuilder('statement')
      .leftJoin('statement.user', 'u')
      .leftJoin(
        PaymentStatementItem,
        'items',
        'items.paymentStatementId = statement.id',
      )
      .select([
        'DATEPART(year, statement.periodStart) as year',
        'DATEPART(month, statement.periodStart) as month',
        'items.currency as currency',
        'COUNT(DISTINCT statement.id) as statementCount',
        'COUNT(DISTINCT statement.userId) as practitionerCount',
        'COUNT(items.id) as totalOrders',
        'SUM(items.unitAmount * items.quantity) as totalAmount',
        `SUM(CASE WHEN statement.status = :paid THEN items.unitAmount * items.quantity ELSE 0 END) as paidAmount`,
        `SUM(CASE WHEN statement.status = :failed THEN items.unitAmount * items.quantity ELSE 0 END) as failedAmount`,
      ])
      .where('statement.userId IS NOT NULL')
      .andWhere('items.id IS NOT NULL')
      .setParameters({ paid, failed });

    const rows = await qb
      .groupBy('DATEPART(year, statement.periodStart)')
      .addGroupBy('DATEPART(month, statement.periodStart)')
      .addGroupBy('items.currency')
      .orderBy('year', 'DESC')
      .addOrderBy('month', 'DESC')
      .getRawMany();

    return rows;
  }

  async getStatementRollupByCurrency() {
    const paid = PaymentStatementStatus.Paid;
    const failed = PaymentStatementStatus.PaymentFailed;

    const qb = this.paymentStatementRepository
      .createQueryBuilder('statement')
      .leftJoin('statement.user', 'u')
      .leftJoin(
        PaymentStatementItem,
        'items',
        'items.paymentStatementId = statement.id',
      )
      .select([
        'items.currency as currency',
        'COUNT(DISTINCT statement.id) as statementCount',
        'COUNT(DISTINCT statement.userId) as practitionerCount',
        'COUNT(items.id) as totalOrders',
        'SUM(items.unitAmount * items.quantity) as totalAmount',
        `SUM(CASE WHEN statement.status = :paid THEN items.unitAmount * items.quantity ELSE 0 END) as paidAmount`,
        `SUM(CASE WHEN statement.status = :failed THEN items.unitAmount * items.quantity ELSE 0 END) as failedAmount`,
      ])
      .where('statement.userId IS NOT NULL')
      .andWhere('items.id IS NOT NULL')
      .setParameters({ paid, failed });

    const rows = await qb
      .groupBy('items.currency')
      .orderBy('totalAmount', 'DESC')
      .getRawMany();
    return rows;
  }

  async getMonthlyStatementsForAdmin(
    pageOptionsDto: PageOptionsDto,
    query: MonthlyStatementQueryDto,
  ): Promise<
    MonthlyStatementWithStatsDto & {
      counts: { all: number; paid: number; unpaid: number };
    }
  > {
    const { take, skip } = pageOptionsDto;
    const { status } = query;

    const baseQB = this.paymentStatementRepository
      .createQueryBuilder('statement')
      .leftJoinAndSelect('statement.user', 'u')
      .leftJoinAndSelect('statement.items', 'items')
      .where('statement.userId IS NOT NULL');

    this.applyMonthYearFilters(baseQB, query);

    if (status) {
      if (status === PaymentStatementQueryStatus.Paid) {
        baseQB.andWhere('statement.status = :paid', {
          paid: PaymentStatementStatus.Paid,
        });
      } else if (status === PaymentStatementQueryStatus.Unpaid) {
        baseQB.andWhere('statement.status != :paid', {
          paid: PaymentStatementStatus.Paid,
        });
      }
    }

    const pageIds = await this.paymentStatementRepository
      .createQueryBuilder('statement')
      .where('statement.userId IS NOT NULL')
      .orderBy('statement.createdAt', 'DESC')
      .take(take)
      .skip(skip)
      .select('statement.id', 'id')
      .getRawMany<{ id: string }>();

    const ids = pageIds.map((r) => r.id);

    const statements = ids.length
      ? await this.paymentStatementRepository
          .createQueryBuilder('statement')
          .leftJoinAndSelect('statement.user', 'u')
          .leftJoinAndSelect('statement.items', 'items')
          .where('statement.id IN (:...ids)', { ids })
          .orderBy('statement.createdAt', 'DESC')
          .getMany()
      : [];

    const total = Number(
      (
        await baseQB
          .clone()
          .select('COUNT(DISTINCT statement.id)', 'cnt')
          .getRawOne()
      )?.cnt ?? 0,
    );

    const countsRow = await this.paymentStatementRepository
      .createQueryBuilder('statement')
      .where('statement.userId IS NOT NULL')
      .select([
        'COUNT(DISTINCT statement.id) AS allCount',
        `SUM(CASE WHEN statement.status = :paid THEN 1 ELSE 0 END) AS paidCount`,
        `SUM(CASE WHEN statement.status <> :paid THEN 1 ELSE 0 END) AS unpaidCount`,
      ])
      .setParameters({ paid: PaymentStatementStatus.Paid })
      .getRawOne<{
        allCount: string | number;
        paidCount: string | number;
        unpaidCount: string | number;
      }>();

    const counts = {
      all: Number(countsRow?.allCount ?? 0),
      paid: Number(countsRow?.paidCount ?? 0),
      unpaid: Number(countsRow?.unpaidCount ?? 0),
    };

    const pageMetaDto = this.makePageMeta(total, pageOptionsDto);
    const result = statements.map((s) => this.mapStatementToDto(s));
    const statistics = await this.calculateCurrentMonthStatistics(false);

    return { result, pageMetaDto, statistics, counts };
  }

  async getMonthlyStatementsForPractitioner(
    userId: string,
    pageOptionsDto: PageOptionsDto,
    query: MonthlyStatementQueryDto,
  ): Promise<
    MonthlyStatementWithStatsDto & {
      counts: { all: number; paid: number; unpaid: number };
    }
  > {
    const { take, skip } = pageOptionsDto;
    const { status } = query;

    const baseQB = this.paymentStatementRepository
      .createQueryBuilder('statement')
      .leftJoinAndSelect('statement.user', 'u')
      .leftJoinAndSelect('statement.items', 'items')
      .where('statement.userId = :userId', { userId })
      .andWhere('statement.invoiceId IS NOT NULL');

    this.applyMonthYearFilters(baseQB, query);

    if (status) {
      if (status === PaymentStatementQueryStatus.Paid) {
        baseQB.andWhere('statement.status = :paid', {
          paid: PaymentStatementStatus.Paid,
        });
      } else if (status === PaymentStatementQueryStatus.Unpaid) {
        baseQB.andWhere('statement.status != :paid', {
          paid: PaymentStatementStatus.Paid,
        });
      }
    }

    const pageIds = await this.paymentStatementRepository
      .createQueryBuilder('statement')
      .where('statement.userId = :userId', { userId })
      .andWhere('statement.invoiceId IS NOT NULL')
      .orderBy('statement.createdAt', 'DESC')
      .take(take)
      .skip(skip)
      .select('statement.id', 'id')
      .getRawMany<{ id: string }>();

    const ids = pageIds.map((r) => r.id);

    const statements = ids.length
      ? await this.paymentStatementRepository
          .createQueryBuilder('statement')
          .leftJoinAndSelect('statement.user', 'u')
          .leftJoinAndSelect('statement.items', 'items')
          .where('statement.id IN (:...ids)', { ids })
          .orderBy('statement.createdAt', 'DESC')
          .getMany()
      : [];

    const total = Number(
      (
        await baseQB
          .clone()
          .select('COUNT(DISTINCT statement.id)', 'cnt')
          .getRawOne()
      )?.cnt ?? 0,
    );

    const countsRow = await this.paymentStatementRepository
      .createQueryBuilder('statement')
      .where('statement.userId = :userId', { userId })
      .andWhere('statement.invoiceId IS NOT NULL')
      .select([
        'COUNT(DISTINCT statement.id) AS allCount',
        `SUM(CASE WHEN statement.status = :paid THEN 1 ELSE 0 END) AS paidCount`,
        `SUM(CASE WHEN statement.status <> :paid THEN 1 ELSE 0 END) AS unpaidCount`,
      ])
      .setParameters({ paid: PaymentStatementStatus.Paid })
      .getRawOne<{
        allCount: string | number;
        paidCount: string | number;
        unpaidCount: string | number;
      }>();

    const counts = {
      all: Number(countsRow?.allCount ?? 0),
      paid: Number(countsRow?.paidCount ?? 0),
      unpaid: Number(countsRow?.unpaidCount ?? 0),
    };

    const pageMetaDto = this.makePageMeta(total, pageOptionsDto);
    const result = statements.map((s) => this.mapStatementToDto(s));

    const statistics = await this.calculateCurrentMonthStatistics(
      true,
      userId,
      true,
    );

    return { result, pageMetaDto, statistics, counts };
  }
}
