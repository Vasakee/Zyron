import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { VaariUsageEvent } from '../entity/vaari-usage-event.entity';
import {
  UsageAnalyticsDto,
  UsageAnalyticsQueryDto,
  UsageSeriesPointDto,
  UsageTableItemDto,
} from '../dto/analytics.dto';
import { generateBuckets } from '../utils/vaari-usage.utils';
import { User } from 'src/user/entity/user.entity';
import { PageMetaDto } from 'src/common';

@Injectable()
export class GetUsageAnalyticsService {
  constructor(
    @InjectRepository(VaariUsageEvent)
    private readonly repo: Repository<VaariUsageEvent>,
  ) {}

  private qbWithUser(): SelectQueryBuilder<VaariUsageEvent> {
    return this.repo
      .createQueryBuilder('e')
      .leftJoin(User, 'u', 'u.id = e.userId')
      .addSelect(['u.firstName', 'u.lastName']);
  }

  private applyRangeAndSearch(
    qb: SelectQueryBuilder<VaariUsageEvent>,
    from?: string,
    to?: string,
    search?: string,
  ) {
    if (from) qb.andWhere('e.createdAt >= :from', { from: new Date(from) });
    if (to) qb.andWhere('e.createdAt < :to', { to: new Date(to) });
    if (search) {
      qb.andWhere(
        '(LOWER(u.firstName) LIKE :s OR LOWER(u.lastName) LIKE :s OR LOWER(e.kitId) LIKE :s)',
        {
          s: `%${search.toLowerCase()}%`,
        },
      );
    }
    return qb;
  }

  async execute(query: UsageAnalyticsQueryDto): Promise<UsageAnalyticsDto> {
    const granularity = (query.granularity || 'daily') as any;
    const buckets = generateBuckets(granularity, query.fromIso, query.toIso);
    const from = buckets.length ? buckets[0].start.toISOString() : undefined;
    const to = buckets.length
      ? buckets[buckets.length - 1].end.toISOString()
      : undefined;

    const baseQb = this.qbWithUser();
    this.applyRangeAndSearch(baseQb, from, to, query.search);

    const rawAgg = await baseQb
      .clone()
      .select(['e.id', 'e.createdAt'])
      .getMany();

    const series: UsageSeriesPointDto[] = buckets.map((b) => ({
      label: b.label,
      startIso: b.start.toISOString(),
      endIso: b.end.toISOString(),
      count: 0,
    }));

    const findIdx = (d: Date) => {
      for (let i = 0; i < series.length; i++) {
        const s = new Date(series[i].startIso);
        const e = new Date(series[i].endIso);
        if (d >= s && d < e) return i;
      }
      return -1;
    };

    for (const ev of rawAgg) {
      const idx = findIdx(new Date((ev as any).createdAt));
      if (idx >= 0) series[idx].count += 1;
    }

    const totalAnalyses = rawAgg.length;

    const page = query.page ?? 1;
    const take = query.take ?? 10;
    const skip = (page - 1) * take;

    const tableQb = this.qbWithUser().select([
      'e.id',
      'e.kitId',
      'e.createdAt',
      'u.firstName',
      'u.lastName',
    ]);
    this.applyRangeAndSearch(tableQb, from, to, query.search);
    tableQb.orderBy('e.createdAt', 'DESC').skip(skip).take(take);

    const [rows, totalItems] = await Promise.all([
      tableQb.getRawMany(),
      this.applyRangeAndSearch(
        this.qbWithUser(),
        from,
        to,
        query.search,
      ).getCount(),
    ]);

    const table: UsageTableItemDto[] = rows.map((r) => ({
      practitionerName:
        [r.u_firstName, r.u_lastName].filter(Boolean).join(' ') || 'Unknown',
      kitId: r.e_kitId ?? null,
      analysisDateIso: new Date(r.e_createdAt).toISOString(),
    }));

    const pageMetaDto = new PageMetaDto({
      itemCount: totalItems,
      pageOptionsDto: query,
    });

    return {
      totalAnalyses,
      series,
      table,
      pageMetaDto,
    };
  }
}
