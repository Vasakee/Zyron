import {
  Processor,
  Process,
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
} from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  QueueNames,
  JobTypes,
  HealthInfoSyncJobData,
} from '../types/queue.types';
import { HealthInfoStatus } from 'src/enum';
import { Kit } from 'src/kit/entity/kit.entity';
import { PractitionerKit } from 'src/kit/entity/practitioner-kits.entity';
import { VitractHealthInfoClient } from 'src/integrations/health-info.client';

@Processor(QueueNames.HEALTH)
@Injectable()
export class HealthInfoSyncProcessor {
  private readonly logger = new Logger(HealthInfoSyncProcessor.name);

  constructor(
    @InjectRepository(Kit) private readonly kitRepo: Repository<Kit>,
    @InjectRepository(PractitionerKit)
    private readonly pkitRepo: Repository<PractitionerKit>,
    private readonly client: VitractHealthInfoClient,
  ) {}

  @Process({ name: JobTypes.HEALTH_INFO_SYNC, concurrency: 1 })
  async handle(job: Job<HealthInfoSyncJobData | undefined>) {
    const batchSize = job.data?.batchSize ?? 200;
    const concurrency = job.data?.concurrency ?? 8;
    const categoryId = 0;

    let updated = 0;
    updated += await this.processTable(
      job,
      'kit',
      this.kitRepo,
      batchSize,
      concurrency,
      categoryId,
    );
    updated += await this.processTable(
      job,
      'practitioner-kits',
      this.pkitRepo,
      batchSize,
      concurrency,
      categoryId,
    );
    return { updated };
  }

  private async processTable(
    job: Job,
    name: string,
    repo: Repository<Kit | PractitionerKit>,
    batchSize: number,
    concurrency: number,
    categoryId: number,
  ): Promise<number> {
    let page = 0;
    let totalUpdated = 0;

    for (;;) {
      const rows = await repo
        .createQueryBuilder('t')
        .where('t.healthInfoCompleted = :no', { no: HealthInfoStatus.NO })
        .orderBy('t.createdAt', 'ASC')
        .offset(page * batchSize)
        .limit(batchSize)
        .getMany();

      if (rows.length === 0) break;

      let cursor = 0;
      let active = 0;
      const tasks: Promise<void>[] = [];

      const runNext = async (): Promise<void> => {
        if (cursor >= rows.length) return;
        const current = rows[cursor++];
        active++;
        try {
          const kitNumber = (current as any).kitNumber?.trim();
          job.log(
            `Checking ${name} id=${(current as any).id} kit=${kitNumber}`,
          );
          if (!kitNumber) return;
          const exists = await this.client.exists(kitNumber, categoryId);
          if (exists) {
            await repo.update((current as any).id, {
              healthInfoCompleted: HealthInfoStatus.YES,
            } as any);
            totalUpdated++;
          }
        } catch {
        } finally {
          active--;
          if (cursor < rows.length) await runNext();
        }
      };

      const starters = Math.min(concurrency, rows.length);
      for (let i = 0; i < starters; i++) tasks.push(runNext());
      await Promise.all(tasks);

      await job.log(
        `Processed ${name} page ${page + 1}, updated so far ${totalUpdated}`,
      );
      page++;
    }

    return totalUpdated;
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Job ${job.id} active (${job.name}).`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: unknown) {
    this.logger.log(`Job ${job.id} completed (${job.name}).`, { result });
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    this.logger.error(`Job ${job.id} failed (${job.name}).`, {
      error: err?.message,
    });
  }
}
