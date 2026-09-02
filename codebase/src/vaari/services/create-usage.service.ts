import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VaariUsageEvent } from '../entity/vaari-usage-event.entity';
import { UsageCache } from '../cache/usage.cache';
import { UsageSseBus } from '../buses/usage.sse.bus';
import { CreateUsageDto } from '../dto/create-usage.dto';

@Injectable()
export class CreateUsageService {
  constructor(
    @InjectRepository(VaariUsageEvent)
    private readonly repo: Repository<VaariUsageEvent>,
    private readonly cache: UsageCache,
    private readonly sse: UsageSseBus,
  ) {}

  async execute(userId: string, dto: CreateUsageDto) {
    const usage = this.repo.create({ userId, kitId: dto.kitId || null });
    await this.repo.save(usage);
    await this.cache.invalidatePatterns([
      `usage:weekly:${userId}`,
      `usage:series:${userId}:`,
      `usage:table:`,
    ]);
    this.sse.emitCreated();
    return { ok: true };
  }
}
