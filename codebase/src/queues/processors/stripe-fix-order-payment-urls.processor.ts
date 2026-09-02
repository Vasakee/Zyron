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
import { In, Repository } from 'typeorm';

import { QueueNames, JobTypes } from '../types/queue.types';
import { Order } from 'src/order/entity/order.entity';
import { StripeCheckoutSession } from 'src/payment/entity/stripe-checkout-session.entity';
import { StripePaymentUrlGeneratorService } from 'src/payment/services/stripe/payment-url-generator.service';
import { isUUID } from 'src/common/utils/validation';

interface FixOrderPaymentUrlsJobData {
  batchSize?: number;
}

const DEFAULT_BATCH_SIZE = 500;
const ORDER_SAVE_CHUNK_SIZE = 200;
const MAX_ITERATIONS = 10_000;

@Processor(QueueNames.STRIPE)
@Injectable()
export class StripeFixOrderPaymentUrlsProcessor {
  private readonly logger = new Logger(StripeFixOrderPaymentUrlsProcessor.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(StripeCheckoutSession)
    private readonly sessionRepo: Repository<StripeCheckoutSession>,
    private readonly paymentUrlGenerator: StripePaymentUrlGeneratorService,
  ) {}

  @Process({ name: JobTypes.FIX_ORDER_PAYMENT_URLS, concurrency: 1 })
  async handle(job: Job<FixOrderPaymentUrlsJobData>) {
    const batchSize = job.data?.batchSize ?? DEFAULT_BATCH_SIZE;

    let offset = 0;
    let iterations = 0;

    while (iterations < MAX_ITERATIONS) {
      iterations++;

      const orders = await this.getNextOrdersWithoutPaymentUrl(
        offset,
        batchSize,
      );
      if (!orders.length) break;

      const orderUpdates = await this.buildOrderPaymentUrlUpdates(orders);

      if (orderUpdates.length) {
        for (let i = 0; i < orderUpdates.length; i += ORDER_SAVE_CHUNK_SIZE) {
          const chunk = orderUpdates.slice(i, i + ORDER_SAVE_CHUNK_SIZE);
          await this.orderRepo.save(chunk);
        }
      }

      await job.log(
        `Processed ${orders.length} orders at offset ${offset}. Updated ${orderUpdates.length} payment URLs.`,
      );

      offset += batchSize;
    }

    if (iterations >= MAX_ITERATIONS) {
      this.logger.warn(
        `Job ${job.id} hit max iteration limit (${MAX_ITERATIONS}). It may need to run again.`,
      );
    }

    return { ok: true, iterations };
  }

  /**
   * Fetches a batch of orders with missing paymentUrl and non-null referenceId.
   */
  private async getNextOrdersWithoutPaymentUrl(
    offset: number,
    take: number,
  ): Promise<Pick<Order, 'id' | 'referenceId'>[]> {
    return this.orderRepo
      .createQueryBuilder('o')
      .select(['o.id', 'o.referenceId'])
      .where("(o.paymentUrl IS NULL OR o.paymentUrl = '')")
      .andWhere('o.referenceId IS NOT NULL')
      .orderBy('o.createdAt', 'ASC')
      .offset(offset)
      .limit(take)
      .getMany();
  }

  /**
   * For a batch of orders, fetches the relevant sessions and builds
   * partial updates for orders.paymentUrl.
   */
  private async buildOrderPaymentUrlUpdates(
    orders: Pick<Order, 'id' | 'referenceId'>[],
  ): Promise<Partial<Order>[]> {
    const piRefIds: string[] = [];
    const uuidRefIds: string[] = [];

    for (const order of orders) {
      const ref = order.referenceId;
      if (!ref) continue;

      if (ref.startsWith('pi_')) {
        piRefIds.push(ref);
      } else if (isUUID(ref)) {
        uuidRefIds.push(ref);
      }
    }

    if (!piRefIds.length && !uuidRefIds.length) {
      return [];
    }

    const sessions = await this.findRelevantSessions(piRefIds, uuidRefIds);
    if (!sessions.length) {
      return [];
    }

    const byPaymentIntentId = new Map<string, StripeCheckoutSession>();
    const byClientReferenceId = new Map<string, StripeCheckoutSession>();

    for (const session of sessions) {
      if (session.paymentIntentId) {
        // Last-write-wins; adjust if you want to prioritize "paid" or latest created
        byPaymentIntentId.set(session.paymentIntentId, session);
      }
      if (session.clientReferenceId) {
        byClientReferenceId.set(session.clientReferenceId, session);
      }
    }

    const updates: Partial<Order>[] = [];

    for (const order of orders) {
      const ref = order.referenceId;
      if (!ref) continue;

      let session: StripeCheckoutSession | undefined;
      let paymentIntentId: string | undefined;

      if (ref.startsWith('pi_')) {
        // Case 1: referenceId is a paymentIntentId
        session = byPaymentIntentId.get(ref);
        paymentIntentId = ref;
      } else if (isUUID(ref)) {
        // Case 2: referenceId is a UUID (clientReferenceId)
        session = byClientReferenceId.get(ref);
        paymentIntentId = session?.paymentIntentId ?? undefined;
      } else {
        // Unknown pattern; skip
        continue;
      }

      // Ensure we have a valid session + paymentIntentId before generating URL
      if (!session || !paymentIntentId || !paymentIntentId.startsWith('pi_')) {
        continue;
      }

      const paymentUrl =
        this.paymentUrlGenerator.generatePaymentUrl(paymentIntentId);
      if (!paymentUrl) continue;

      updates.push({
        id: order.id,
        paymentUrl,
      });
    }

    return updates;
  }

  /**
   * Fetches StripeCheckoutSession rows relevant for the given paymentIntentIds and clientReferenceIds.
   */
  private async findRelevantSessions(
    piRefIds: string[],
    uuidRefIds: string[],
  ): Promise<StripeCheckoutSession[]> {
    const qb = this.sessionRepo.createQueryBuilder('s');

    // Start with a false condition so we can orWhere safely
    qb.where('1 = 0');

    if (piRefIds.length) {
      qb.orWhere('s.paymentIntentId IN (:...piRefIds)', { piRefIds });
    }

    if (uuidRefIds.length) {
      qb.orWhere('s.clientReferenceId IN (:...uuidRefIds)', { uuidRefIds });
    }

    return qb.getMany();
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Job ${job.id} active (${job.name}).`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: unknown) {
    this.logger.log(
      `Job ${job.id} completed (${job.name}). Result: ${JSON.stringify(
        result,
      )}`,
    );
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    this.logger.error(
      `Job ${job.id} failed (${job.name}): ${err?.message}`,
      err?.stack,
    );
  }
}
