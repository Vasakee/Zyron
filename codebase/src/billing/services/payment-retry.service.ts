import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';
import Stripe from 'stripe';
import { DateTime } from 'luxon';

import { PaymentStatement } from 'src/payment/entity/payment-statement.entity';
import { Order } from 'src/order/entity/order.entity';
import { Transaction } from 'src/payment/entity/transaction.entity';
import {
  PaymentStatementStatus,
  OrderStatus,
  TransactionStatus,
} from 'src/enum';
import {
  SYSTEM_TIME_ZONE,
  BILLING_PERIOD_START_DAY,
  BILLING_PERIOD_END_DAY,
  RETRY_PERIOD_END_DAY,
} from 'src/config';
import { RetrieveInvoiceService } from 'src/payment/services/retrieve-invoice';
import { SendInvoiceService } from 'src/payment/services/send-invoice';
import { PayInvoiceService } from 'src/payment/services/pay-invoice';
import { CreateInvoiceService } from 'src/payment/services/create-invoice';
import { ProcessOpenStatementsService } from './process-open-statements.service';

type ClaimedRetry = { id: string; userId: string; invoiceId: string };
type FailureInfo = { code?: string; message?: string };

const makeKey = (userId: string, invoiceId: string) =>
  JSON.stringify([userId, invoiceId]);
const parseKey = (key: string) => JSON.parse(key) as [string, string];

const BATCH_SIZE = 500;

@Injectable()
export class PaymentRetryService {
  private readonly logger = new Logger(PaymentRetryService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly retrieveInvoice: RetrieveInvoiceService,
    private readonly sendInvoiceService: SendInvoiceService,
    private readonly payInvoiceService: PayInvoiceService,
    private readonly createInvoiceService: CreateInvoiceService,
    private readonly processOpenStatementsService: ProcessOpenStatementsService,
  ) {}

  private getBillingWindows(now: DateTime): {
    current: string;
    previous: string;
  } {
    const startDay = parseInt(BILLING_PERIOD_START_DAY || '26', 10);
    const endDay = parseInt(BILLING_PERIOD_END_DAY || '25', 10);

    // Current billing window end date
    const currentEnd =
      now.day >= startDay
        ? now.plus({ months: 1 }).set({ day: endDay })
        : now.set({ day: endDay });

    // Previous billing window end date
    const previousEnd = currentEnd.minus({ months: 1 });

    return {
      current: currentEnd.toISODate(),
      previous: previousEnd.toISODate(),
    };
  }

  async processRetryDay(): Promise<void> {
    const bizDay = DateTime.now().setZone(SYSTEM_TIME_ZONE).startOf('day');
    const bizISO = bizDay.toISODate();
    const day = bizDay.day;

    const billingStartDay = parseInt(BILLING_PERIOD_START_DAY || '26', 10);
    const billingRetryEndDay = parseInt(RETRY_PERIOD_END_DAY || '28', 10);
    const billingCaptureDay = billingStartDay - 1; // Day before start (was 25)

    const isCaptureDay = day === billingCaptureDay;
    const isRetryWindow = day >= billingStartDay && day <= billingRetryEndDay;
    const isAfterRetryWindow = day > billingRetryEndDay;

    this.logger.log(
      `Retry pass for tz=${SYSTEM_TIME_ZONE} day=${bizISO} (${billingCaptureDay}=capture, ${billingStartDay}-${billingRetryEndDay}=retry, >${billingRetryEndDay}=fail)`,
    );

    if (isCaptureDay) {
      return;
    }

    // First, handle Open statements by creating invoices for them
    await this.processOpenStatementsService.execute(bizDay);

    // Then, handle Finalized statements for retry/failure
    const claimed = await this.claimRetryCandidates();
    if (claimed.length === 0) {
      this.logger.log('No statements eligible for retry/finalization today.');
      return;
    }

    const groups = new Map<
      string,
      { userId: string; invoiceId: string; ids: string[] }
    >();
    for (const r of claimed) {
      if (!r.userId || !r.invoiceId) continue;
      const key = makeKey(r.userId, r.invoiceId);
      const bucket = groups.get(key) ?? {
        userId: r.userId,
        invoiceId: r.invoiceId,
        ids: [],
      };
      bucket.ids.push(r.id);
      groups.set(key, bucket);
    }
    this.logger.log(
      `Retry: grouped ${claimed.length} statements into ${groups.size} user/invoice groups`,
    );

    for (const k of groups.keys()) {
      const [userId, invoiceId] = parseKey(k);
      const { ids } = groups.get(k);
      try {
        // (Optional) hydrate for future use; we keep it light
        const [statements] = await Promise.all([
          this.dataSource.getRepository(PaymentStatement).find({
            where: { id: In(ids) },
            order: { createdAt: 'ASC', id: 'ASC' },
          }),
        ]);
        if (!statements.length) {
          this.logger.warn(
            `Group ${userId}/${invoiceId}: no statements found after claim; skipping`,
          );
          // Revert claims to Finalized so they can be picked up later if needed
          await this.revertToFinalized(ids);
          continue;
        }

        const invoice = await this.retrieveInvoice.execute(invoiceId);

        // Fast-path: already paid
        if (invoice.status === 'paid') {
          await this.updatePaidInvoiceForUser(userId, invoiceId, invoice);
          continue;
        }

        // Terminal statuses
        if (invoice.status === 'void' || invoice.status === 'uncollectible') {
          await this.markPaymentFailedForUser(userId, invoiceId, {
            message: `Invoice ${invoice.status}`,
          });
          continue;
        }

        // Open invoices
        if (invoice.status === 'open') {
          if (invoice.collection_method === 'charge_automatically') {
            if (isRetryWindow) {
              const idempotencyKey = `retry:${invoiceId}:${bizISO}`;
              this.logger.log(
                `Retrying auto-collect for invoice ${invoiceId} (user ${userId})`,
              );
              try {
                const retried = await this.payInvoiceService.execute(
                  invoiceId,
                  undefined,
                  { idempotencyKey },
                );
                if (retried.status === 'paid') {
                  await this.updatePaidInvoiceForUser(
                    userId,
                    invoiceId,
                    retried,
                  );
                } else {
                  this.logger.log(
                    `Retry attempted but invoice not paid (${retried.status}) for ${invoiceId} (user ${userId})`,
                  );
                  // Keep as Finalized to allow next day retry within window
                  await this.revertToFinalized(ids);
                }
              } catch (e: any) {
                const { code, message } = this.parseStripeError(e);
                this.logger.error(
                  `Retry attempt failed for ${invoiceId} (user ${userId}) - ${
                    code ?? ''
                  } ${message ?? ''}`,
                );
                if (isAfterRetryWindow) {
                  await this.markPaymentFailedForUser(userId, invoiceId, {
                    code,
                    message,
                  });
                } else {
                  await this.revertToFinalized(ids);
                }
              }
            } else if (isAfterRetryWindow) {
              await this.markPaymentFailedForUser(userId, invoiceId, {
                message: 'Retry window elapsed',
              });
            } else {
              // Retry window not reached yet → revert to Finalized for future attempt
              await this.revertToFinalized(ids);
            }
          } else {
            // Manual collection: send invoice during the window; otherwise revert state
            if (isRetryWindow) {
              this.logger.log(
                `Sending invoice ${invoiceId} to customer (user ${userId}) - manual collection`,
              );
              try {
                const sent = await this.sendInvoiceService.execute(invoiceId);
                this.logger.log(
                  `Invoice sent: ${invoiceId} (status: ${sent.status})`,
                );
              } catch (e: any) {
                const { code, message } = this.parseStripeError(e);
                this.logger.error(
                  `Failed to send invoice ${invoiceId} (user ${userId}) - ${
                    code ?? ''
                  } ${message ?? ''}`,
                );
              } finally {
                await this.revertToFinalized(ids);
              }
            } else if (isAfterRetryWindow) {
              await this.markPaymentFailedForUser(userId, invoiceId, {
                message: 'Retry window elapsed (manual)',
              });
            } else {
              await this.revertToFinalized(ids);
            }
          }
        }
      } catch (err: any) {
        this.logger.error(
          `Retry: group failed (user ${userId}, invoice ${invoiceId})`,
          err,
        );
        if (isAfterRetryWindow) {
          const { code, message } = this.parseStripeError(err);
          await this.markPaymentFailedForUser(userId, invoiceId, {
            code,
            message,
          });
        } else {
          await this.revertToFinalized(ids);
        }
      }
    }
  }

  /**
   * Claim: Finalized + has invoice + not paid → set to Processing, return claimed set.
   */
  private async claimRetryCandidates(): Promise<ClaimedRetry[]> {
    let claimed: ClaimedRetry[] = [];
    await this.dataSource.transaction(async (m) => {
      const rows: Array<{ id: string; userId: string; invoiceId: string }> =
        await m.query(
          `
            ;WITH pair_candidates AS (
              SELECT
                ps.userId,
                ps.invoiceId,
                MIN(ps.createdAt) AS firstCreatedAt
              FROM payment_statements ps WITH (UPDLOCK, READPAST, ROWLOCK)
              WHERE ps.status = @1
                AND ps.paidAt IS NULL
                AND ps.invoiceId IS NOT NULL
                AND (ps.nextAttemptAt IS NULL OR ps.nextAttemptAt <= SYSUTCDATETIME())
              GROUP BY ps.userId, ps.invoiceId
            ),
            pairs AS (
              SELECT TOP (@0)
                     pc.userId,
                     pc.invoiceId
              FROM pair_candidates pc
              ORDER BY
                COALESCE(pc.firstCreatedAt, SYSUTCDATETIME()) ASC,  -- keep as tiebreaker
                pc.userId ASC, pc.invoiceId ASC
            ),
            cte AS (
              SELECT ps.id, ps.userId, ps.invoiceId
              FROM payment_statements ps WITH (UPDLOCK, READPAST, ROWLOCK)
              JOIN pairs p
                ON p.userId = ps.userId AND p.invoiceId = ps.invoiceId
              WHERE ps.status = @1
                AND ps.paidAt IS NULL
                AND ps.invoiceId IS NOT NULL
                AND (ps.nextAttemptAt IS NULL OR ps.nextAttemptAt <= SYSUTCDATETIME())
            )
            UPDATE ps
               SET ps.status = @2
            OUTPUT inserted.id AS id, inserted.userId AS userId, inserted.invoiceId AS invoiceId
              FROM payment_statements ps
              JOIN cte ON cte.id = ps.id;
          `,
          [
            BATCH_SIZE,
            PaymentStatementStatus.Finalized,
            PaymentStatementStatus.Processing,
          ],
        );

      claimed = rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        invoiceId: r.invoiceId,
      }));
      this.logger.log(
        `Claimed ${claimed.length} statements across ${
          new Set(rows.map((r) => makeKey(r.userId, r.invoiceId))).size
        } invoice groups`,
      );
    });

    return claimed;
  }

  private async revertToFinalized(ids: string[]): Promise<void> {
    if (!ids.length) return;
    await this.dataSource
      .createQueryBuilder()
      .update(PaymentStatement)
      .set({
        status: PaymentStatementStatus.Finalized,
        attemptCount: () => 'attemptCount + 1',
        lastAttemptAt: () => 'SYSUTCDATETIME()',
        nextAttemptAt: () => `
        DATEADD(minute,
          POWER(2, CASE WHEN attemptCount > 6 THEN 6 ELSE attemptCount END),
          SYSUTCDATETIME()
        )`,
      } as any)
      .where('id IN (:...ids)', { ids })
      .andWhere('status = :processing', {
        processing: PaymentStatementStatus.Processing,
      })
      .execute();
  }

  private async updatePaidInvoiceForUser(
    userId: string,
    invoiceId: string,
    invoice: Stripe.Invoice,
  ): Promise<void> {
    const paidAtSec = invoice.status_transitions?.paid_at;
    const paidAt = paidAtSec ? new Date(paidAtSec * 1000) : new Date();

    await this.dataSource.transaction(async (m) => {
      const txRepo = m.getRepository(Transaction);
      const existing = await txRepo.findOne({
        where: { userId, stripeInvoiceId: invoiceId },
      });

      const baseMeta = {
        hosted_invoice_url: invoice.hosted_invoice_url,
        invoice_pdf:
          typeof invoice.invoice_pdf === 'string' ? invoice.invoice_pdf : null,
      };

      if (!existing) {
        const tx = txRepo.create({
          referenceId: `inv_${invoiceId}`,
          userId,
          stripeInvoiceId: invoiceId,
          amount: invoice.amount_due ?? invoice.total ?? 0,
          currency: invoice.currency ?? 'usd',
          status: TransactionStatus.Successful,
          paidAt,
          metadata: JSON.stringify(baseMeta),
        });
        await txRepo.save(tx);
      } else if (existing.status !== TransactionStatus.Successful) {
        await txRepo.update(
          { userId, stripeInvoiceId: invoiceId },
          {
            status: TransactionStatus.Successful,
            paidAt,
            metadata: JSON.stringify(baseMeta) as any,
          },
        );
      }

      await m
        .createQueryBuilder()
        .update(PaymentStatement)
        .set({
          status: PaymentStatementStatus.Paid,
          paidAt,
          invoiceStatus: invoice.status as string,
          invoiceUrl: invoice.hosted_invoice_url as any,
          invoicePdf:
            typeof invoice.invoice_pdf === 'string'
              ? invoice.invoice_pdf
              : null,
        })
        .where('userId = :userId', { userId })
        .andWhere('invoiceId = :invoiceId', { invoiceId })
        .execute();

      await m
        .createQueryBuilder()
        .update(Order)
        .set({ status: OrderStatus.Paid })
        .where('userId = :userId', { userId })
        .andWhere('invoiceId = :invoiceId', { invoiceId })
        .execute();
    });

    this.logger.log(`PAID: invoice ${invoice.id} for user ${userId}`);
  }

  private async markPaymentFailedForUser(
    userId: string,
    invoiceId: string,
    failure?: FailureInfo,
  ): Promise<void> {
    await this.dataSource.transaction(async (m) => {
      await m
        .createQueryBuilder()
        .update(PaymentStatement)
        .set({
          status: PaymentStatementStatus.PaymentFailed,
          invoiceStatus: 'payment_failed',
          failureReason: failure?.message ?? null,
          nextAttemptAt: null,
        } as any)
        .where('userId = :userId', { userId })
        .andWhere('invoiceId = :invoiceId', { invoiceId })
        .execute();

      await m
        .createQueryBuilder()
        .update(Transaction)
        .set({
          status: TransactionStatus.Failed,
          metadata: JSON.stringify({
            ...(failure?.message ? { failure_message: failure.message } : {}),
            ...(failure?.code ? { failure_code: failure.code } : {}),
          }),
        } as any)
        .where('userId = :userId', { userId })
        .andWhere('stripeInvoiceId = :invoiceId', { invoiceId })
        .execute();
    });

    this.logger.log(
      `FAILED: invoice ${invoiceId} for user ${userId} (${
        failure?.code ?? ''
      } ${failure?.message ?? ''})`,
    );
  }

  private parseStripeError(e: any): FailureInfo {
    const err = e?.raw ?? e;
    return {
      code: err?.code ?? err?.type ?? undefined,
      message: err?.message ?? err?.error?.message ?? undefined,
    };
  }
}
