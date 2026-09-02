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
  EnrichTransactionsJobData,
} from '../types/queue.types';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { StripeCheckoutSession } from 'src/payment/entity/stripe-checkout-session.entity';
import { Transaction } from 'src/payment/entity/transaction.entity';

@Processor(QueueNames.STRIPE)
@Injectable()
export class StripeEnrichTransactionsProcessor {
  private readonly logger = new Logger(StripeEnrichTransactionsProcessor.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
    @InjectRepository(StripeCheckoutSession)
    private readonly sessionRepo: Repository<StripeCheckoutSession>,
  ) {}

  @Process({ name: JobTypes.ENRICH_TRANSACTIONS_FROM_SESSIONS, concurrency: 2 })
  async handle(job: Job<EnrichTransactionsJobData>) {
    const batchSize = job.data?.batchSize ?? 500;

    let offset = 0;
    while (true) {
      const txs = await this.txRepo.find({
        select: ['id', 'referenceId'],
        where: {
          referenceId: In(
            await this.getNextReferenceIds(offset, batchSize),
          ) as any,
        },
      });
      if (txs.length === 0) break;

      const refIds = txs.map((t) => t.referenceId).filter(Boolean);
      const sessions = await this.sessionRepo
        .createQueryBuilder('s')
        .where('s.clientReferenceId IN (:...refIds)', { refIds })
        .getMany();

      const byRef = new Map<string, StripeCheckoutSession>();
      for (const s of sessions)
        if (s.clientReferenceId) byRef.set(s.clientReferenceId, s);

      const updates: Partial<Transaction & { id: string }>[] = [];
      for (const t of txs) {
        const match = t.referenceId ? byRef.get(t.referenceId) : undefined;
        if (!match) continue;
        updates.push({
          id: t.id,
          amount: match.amountTotal ?? 0,
          currency: match.currency ?? 'usd',
          paymentIntentId: match.paymentIntentId ?? null,
          sessionId: match.stripeSessionId ?? null,
          stripeInvoiceId: null,
          promotionCodeId: null,
          paidAt:
            match.paymentStatus === 'paid'
              ? new Date((match.created ?? 0) * 1000)
              : null,
          metadata: null,
        });
      }

      for (let i = 0; i < updates.length; i += 200) {
        const chunk = updates.slice(i, i + 200);
        await this.txRepo.save(chunk);
      }

      await job.log(
        `Enriched ${updates.length} transactions at offset ${offset}`,
      );
      offset += batchSize;
    }

    return { ok: true };
  }

  private async getNextReferenceIds(
    offset: number,
    take: number,
  ): Promise<string[]> {
    const rows = await this.txRepo
      .createQueryBuilder('t')
      .select(['t.referenceId'])
      .where('t.referenceId IS NOT NULL AND t.gateway = :gateway', {
        gateway: 'stripe',
      })
      .orderBy('t.createdAt', 'ASC')
      .offset(offset)
      .limit(take)
      .getRawMany<{ t_referenceId: string }>();
    return rows.map((r) => r.t_referenceId).filter(Boolean);
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
