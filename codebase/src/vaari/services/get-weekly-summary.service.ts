import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { VaariUsageEvent } from '../entity/vaari-usage-event.entity';
import { UsageCache } from '../cache/usage.cache';
import { weekWindow } from '../utils/vaari-usage.utils';

@Injectable()
export class WeeklySummaryService {
  constructor(
    @InjectRepository(VaariUsageEvent)
    private readonly repo: Repository<VaariUsageEvent>,
    private readonly cache: UsageCache,
  ) {}

  async execute(userId: string) {
    await this.cache.invalidatePatterns([`usage:weekly:${userId}`]);
    const key = this.cache.weeklyKey(userId);
    const cached = await this.cache.get<any>(key);
    if (cached) return cached;

    const { start, end } = weekWindow();
    const count = await this.repo.count({
      where: { userId, createdAt: Between(start, end) },
    });
    const limit = 7;
    const remaining = Math.max(0, limit - count);
    const resetAtIso = new Date(
      Date.UTC(
        end.getUTCFullYear(),
        end.getUTCMonth(),
        end.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    ).toISOString();
    const result = { limit, used: count, remaining, resetsAtIso: resetAtIso };

    await this.cache.set(key, result);
    return result;
  }
}
