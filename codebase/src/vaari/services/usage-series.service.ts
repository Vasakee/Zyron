import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { DateTime, Interval } from 'luxon';
import { VaariUsageEvent } from '../entity/vaari-usage-event.entity';
import { UsageCache } from '../cache/usage.cache';
import { UsageSeriesDto } from '../dto/usage-series.dto';

type Granularity = 'daily' | 'weekly' | 'monthly' | 'yearly';

@Injectable()
export class UsageSeriesService {
  constructor(
    @InjectRepository(VaariUsageEvent)
    private readonly usageRepo: Repository<VaariUsageEvent>,
    private readonly cache: UsageCache,
  ) {}

  async execute(dto: UsageSeriesDto) {
    const granularity: Granularity =
      (dto.granularity as Granularity) ?? 'daily';

    const { fromUtc, toUtcExclusive } = this.resolveRange(
      granularity,
      dto.fromIso,
      dto.toIso,
    );

    const cacheKey = this.cache.seriesKey(
      granularity,
      fromUtc.toISO(),
      toUtcExclusive.toISO(),
    );
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) return cached;

    const rows = await this.usageRepo.find({
      where: {
        createdAt: Between(fromUtc.toJSDate(), toUtcExclusive.toJSDate()),
      },
      select: ['id', 'createdAt'],
      order: { createdAt: 'ASC' },
    });

    const series = this.bucket(
      rows.map((r) => r.createdAt),
      fromUtc,
      toUtcExclusive,
      granularity,
    );

    const totalAnalysis = rows.length;
    const result = { totalAnalysis, series };

    await this.cache.set(cacheKey, result);
    return result;
  }

  private resolveRange(
    granularity: Granularity,
    fromIso?: string,
    toIso?: string,
  ) {
    const now = DateTime.utc();

    if (fromIso && toIso) {
      const from = DateTime.fromISO(fromIso, { zone: 'utc' }).startOf('second');
      const to = DateTime.fromISO(toIso, { zone: 'utc' }).endOf('day');
      const toExclusive = to.plus({ milliseconds: 1 });
      return { fromUtc: from, toUtcExclusive: toExclusive };
    }

    switch (granularity) {
      case 'daily': {
        const start = now.startOf('week');
        const endExclusive = start.plus({ weeks: 1 });
        return { fromUtc: start, toUtcExclusive: endExclusive };
      }
      case 'weekly': {
        const start = now.startOf('quarter'); // reasonable default window
        const endExclusive = start.plus({ months: 3 });
        return { fromUtc: start, toUtcExclusive: endExclusive };
      }
      case 'monthly': {
        const start = now.startOf('year');
        const endExclusive = start.plus({ years: 1 });
        return { fromUtc: start, toUtcExclusive: endExclusive };
      }
      case 'yearly': {
        const start = now.minus({ years: 6 }).startOf('year');
        const endExclusive = now.endOf('year').plus({ milliseconds: 1 });
        return { fromUtc: start, toUtcExclusive: endExclusive };
      }
    }
  }

  private bucket(
    createdAts: Date[],
    fromUtc: DateTime,
    toUtcExclusive: DateTime,
    granularity: Granularity,
  ) {
    const interval = Interval.fromDateTimes(fromUtc, toUtcExclusive);
    const points: {
      label: string;
      count: number;
      startIso: string;
      endIso: string;
    }[] = [];

    if (granularity === 'daily') {
      let cursor = fromUtc.startOf('day');
      while (cursor < toUtcExclusive) {
        const dayStart = cursor;
        const dayEnd = cursor.plus({ days: 1 });
        const label = dayStart.toFormat('ccc');
        points.push({
          label,
          count: 0,
          startIso: dayStart.toISO(),
          endIso: dayEnd.toISO(),
        });
        cursor = dayEnd;
      }
    } else if (granularity === 'weekly') {
      let cursor = fromUtc.startOf('week');
      while (cursor < toUtcExclusive) {
        const wkStart = cursor;
        const wkEnd = cursor.plus({ weeks: 1 });
        const weekNum = wkStart.weekNumber;
        const label = `Wk ${weekNum}`;
        points.push({
          label,
          count: 0,
          startIso: wkStart.toISO(),
          endIso: wkEnd.toISO(),
        });
        cursor = wkEnd;
      }
    } else if (granularity === 'monthly') {
      let cursor = fromUtc.startOf('month');
      while (cursor < toUtcExclusive) {
        const mStart = cursor;
        const mEnd = cursor.plus({ months: 1 });
        const label = mStart.toFormat('LLL');
        points.push({
          label,
          count: 0,
          startIso: mStart.toISO(),
          endIso: mEnd.toISO(),
        });
        cursor = mEnd;
      }
    } else if (granularity === 'yearly') {
      let cursor = fromUtc.startOf('year');
      while (cursor < toUtcExclusive) {
        const yStart = cursor;
        const yEnd = cursor.plus({ years: 1 });
        const label = yStart.toFormat('yyyy');
        points.push({
          label,
          count: 0,
          startIso: yStart.toISO(),
          endIso: yEnd.toISO(),
        });
        cursor = yEnd;
      }
    }

    const dtTimes = createdAts.map((d) => DateTime.fromJSDate(d).toUTC());
    for (const d of dtTimes) {
      if (!interval.contains(d)) continue;
      const idx = points.findIndex(
        (p) =>
          DateTime.fromISO(p.startIso) <= d && d < DateTime.fromISO(p.endIso),
      );
      if (idx >= 0) points[idx].count += 1;
    }

    return points;
  }
}
