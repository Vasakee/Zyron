import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsageTableQueryDto } from '../dto/usage-table-query.dto';
import { PageMetaDto } from 'src/common';
import { VaariUsageEvent } from '../entity/vaari-usage-event.entity';
import { UsageCache } from '../cache/usage.cache';

@Injectable()
export class UsageTableService {
  constructor(
    @InjectRepository(VaariUsageEvent)
    private readonly usageRepo: Repository<VaariUsageEvent>,
    private readonly cache: UsageCache,
  ) {}

  async execute(dto: UsageTableQueryDto) {
    const take = dto.take ?? 10;
    const page = dto.page ?? 1;
    const skip = (page - 1) * take;

    const q = (dto.search ?? '').trim().toLowerCase();
    const cacheKey = this.cache.tableKey(q, page, take);
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) return cached;

    const qb = this.usageRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.user', 'u')
      .select([
        'e.id',
        'e.createdAt',
        'e.kitId',
        'e.userId',
        'u.firstName',
        'u.lastName',
      ])
      .orderBy('e.createdAt', 'DESC')
      .take(take)
      .skip(skip);

    if (q) {
      qb.andWhere(
        `
          LOWER(COALESCE(e.kitId, '')) LIKE :q
          OR LOWER(COALESCE(u.firstName, '')) LIKE :q
          OR LOWER(COALESCE(u.lastName, '')) LIKE :q
          OR LOWER(COALESCE(CONCAT(u.firstName, ' ', u.lastName), '')) LIKE :q
        `,
        { q: `%${q}%` },
      );
    }

    const [rows, total] = await qb.getManyAndCount();

    const table = rows.map((r) => ({
      practitionerName: `${r.user?.firstName ?? ''} ${
        r.user?.lastName ?? ''
      }`.trim(),
      kitId: r.kitId ?? null,
      analysisDateIso: r.createdAt.toISOString(),
    }));

    const pageMetaDto = new PageMetaDto({
      itemCount: total,
      pageOptionsDto: { page, take } as any,
    });

    const result = { table, pageMetaDto };
    await this.cache.set(cacheKey, result);
    return result;
  }
}
