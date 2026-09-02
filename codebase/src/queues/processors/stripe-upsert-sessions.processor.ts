import {
  Processor,
  Process,
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
} from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import {
  QueueNames,
  JobTypes,
  UpsertCheckoutSessionsJobData,
} from '../types/queue.types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetCheckoutSessions } from 'src/payment/services/get-checkout-sessions';
import { StripeCheckoutSession } from 'src/payment/entity/stripe-checkout-session.entity';

@Processor(QueueNames.STRIPE)
@Injectable()
export class StripeUpsertSessionsProcessor {
  private readonly logger = new Logger(StripeUpsertSessionsProcessor.name);

  constructor(
    private readonly getSessions: GetCheckoutSessions,
    @InjectRepository(StripeCheckoutSession)
    private readonly sessionRepo: Repository<StripeCheckoutSession>,
  ) {}

  @Process({ name: JobTypes.UPSERT_CHECKOUT_SESSIONS, concurrency: 2 })
  async handle(job: Job<UpsertCheckoutSessionsJobData>) {
    const createdFrom = job.data?.createdFrom;
    const createdTo = job.data?.createdTo;

    const sessions = await this.getSessions.execute();

    const rows = sessions
      .filter((s) => {
        if (createdFrom && s.created < createdFrom) return false;
        if (createdTo && s.created > createdTo) return false;
        return true;
      })
      .map((s) => {
        const entity = new StripeCheckoutSession();
        entity.stripeSessionId = s.id;
        entity.clientReferenceId = s.client_reference_id ?? null;
        entity.customerId =
          typeof s.customer === 'string' ? s.customer : s.customer?.id ?? null;
        entity.paymentIntentId =
          typeof s.payment_intent === 'string'
            ? s.payment_intent
            : s.payment_intent?.id ?? null;
        entity.subscriptionId =
          typeof s.subscription === 'string'
            ? s.subscription
            : s.subscription?.id ?? null;
        entity.status = s.status ?? null;
        entity.paymentStatus = s.payment_status ?? null;
        entity.mode = s.mode ?? null;
        entity.amountSubtotal = s.amount_subtotal ?? null;
        entity.amountTotal = s.amount_total ?? null;
        entity.currency = s.currency ?? null;
        entity.url = s.url ?? null;
        entity.created = s.created ?? null;
        entity.expiresAt = s.expires_at ?? null;
        entity.metadata = s.metadata ? JSON.stringify(s.metadata) : null;
        entity.raw = JSON.stringify(s);
        return entity;
      });

    const COLS = 16;
    const MAX_PARAMS = 2000;
    const requested = job.data?.batchSize ?? 500;
    const safeBatchSize = Math.max(
      25,
      Math.min(requested, Math.floor(MAX_PARAMS / (COLS * 2))),
    );

    for (let i = 0; i < rows.length; i += safeBatchSize) {
      const chunk = rows.slice(i, i + safeBatchSize);
      await this.sessionRepo.upsert(chunk, {
        conflictPaths: ['stripeSessionId'],
      });
      await job.log(
        `Upserted ${Math.min(i + safeBatchSize, rows.length)}/${rows.length}`,
      );
    }

    return { upserted: rows.length, batchSizeUsed: safeBatchSize };
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
