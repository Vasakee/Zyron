import {
  Processor,
  Process,
  OnQueueFailed,
  OnQueueCompleted,
  OnQueueActive,
} from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import {
  QueueNames,
  JobTypes,
  SyncStripePricesJobData,
} from '../types/queue.types';
import { StripeSyncPricesService } from 'src/payment/services/stripe-sync-prices.service';

@Processor(QueueNames.STRIPE)
@Injectable()
export class StripeSyncPricesProcessor {
  private readonly logger = new Logger(StripeSyncPricesProcessor.name);

  constructor(
    private readonly stripeSyncPricesService: StripeSyncPricesService,
  ) {}

  @Process({ name: JobTypes.SYNC_STRIPE_PRICES, concurrency: 2 })
  async handle(job: Job<SyncStripePricesJobData>) {
    return this.stripeSyncPricesService.sync(
      job.data?.priceIds,
      async (priceId, err) => {
        await job.log(`Failed to sync price ${priceId}: ${err.message}`);
        this.logger.error(`Failed to sync price ${priceId}`, {
          error: err.message,
        });
      },
    );
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
