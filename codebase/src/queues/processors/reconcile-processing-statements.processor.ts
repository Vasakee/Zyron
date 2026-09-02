import {
  Processor,
  Process,
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
} from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { ReconcileProcessingStatementsService } from '../services/reconcile-processing-statements.service';
import { JobTypes, QueueNames } from '../types/queue.types';

@Processor(QueueNames.BILLING)
@Injectable()
export class ReconcileProcessingStatementsProcessor {
  private readonly logger = new Logger(
    ReconcileProcessingStatementsProcessor.name,
  );

  constructor(private readonly svc: ReconcileProcessingStatementsService) {}

  @Process({ name: JobTypes.RECONCILE_PROCESSING, concurrency: 2 })
  async handle(job: Job<{ maxAgeMinutes?: number; userGroupLimit?: number }>) {
    const maxAgeMinutes = job.data?.maxAgeMinutes ?? 30;
    const userGroupLimit = job.data?.userGroupLimit ?? 200;

    const { groups } = await this.svc.execute(maxAgeMinutes, userGroupLimit);
    await job.log(`Reconciled scan done. Groups processed: ${groups}`);

    return { ok: true, groups };
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
