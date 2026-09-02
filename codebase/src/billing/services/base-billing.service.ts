import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';
import { PaymentStatement } from 'src/payment/entity/payment-statement.entity';
import { PaymentStatementStatus } from 'src/enum';
import { CreateInvoiceService } from 'src/payment/services/create-invoice';

type ClaimedRow = { id: string; userId: string; currency: string };

export const makeKey = (userId: string, currency: string) =>
  JSON.stringify([userId, currency.trim()]);
export const parseKey = (key: string) => JSON.parse(key) as [string, string];

@Injectable()
export class BaseBillingService {
  protected readonly logger = new Logger(BaseBillingService.name);

  constructor(
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly createInvoiceService: CreateInvoiceService,
  ) {}

  protected async claimStatements(
    status: PaymentStatementStatus,
    periodFilters: string[],
    params: any[],
    batchSize = 500,
  ): Promise<ClaimedRow[]> {
    let claimed: ClaimedRow[] = [];

    await this.dataSource.transaction(async (m) => {
      const periodCondition = periodFilters.join(' OR ');

      const rows: Array<{ id: string; userId: string; currency: string }> =
        await m.query(
          `
          ;WITH user_currency_to_bill AS (
            SELECT TOP (@0) ps.userId, ps.currency, MIN(ps.createdAt) AS firstCreatedAt
            FROM payment_statements ps WITH (UPDLOCK, READPAST, ROWLOCK)
            WHERE ps.status = @1
              AND (${periodCondition})
              AND (ps.nextAttemptAt IS NULL
                   OR ps.nextAttemptAt <= SYSUTCDATETIME())
            GROUP BY ps.userId, ps.currency
            ORDER BY COALESCE(MIN(ps.createdAt), SYSUTCDATETIME()) ASC
          ),
          cte AS (
            SELECT ps.id, ps.userId, ps.currency
            FROM payment_statements ps WITH (UPDLOCK, READPAST, ROWLOCK)
            JOIN user_currency_to_bill u ON u.userId = ps.userId AND u.currency = ps.currency
            WHERE ps.status = @1
              AND (${periodCondition})
              AND (ps.nextAttemptAt IS NULL
                   OR ps.nextAttemptAt <= SYSUTCDATETIME())
          )
          UPDATE ps
             SET ps.status = @2
          OUTPUT inserted.id AS id, inserted.userId AS userId, inserted.currency AS currency
            FROM payment_statements ps
            JOIN cte ON cte.id = ps.id;
        `,
          [batchSize, status, PaymentStatementStatus.Processing, ...params],
        );

      claimed = rows.map((r) => ({
        id: String(r.id),
        userId: String(r.userId),
        currency: String(r.currency),
      }));

      this.logger.log(
        `Claimed ${claimed.length} ${status} statements across ${
          new Set(claimed.map((r) => makeKey(r.userId, r.currency))).size
        } user/currency combinations`,
      );
    });

    return claimed;
  }

  protected async processClaimedStatements(
    claimed: ClaimedRow[],
    operationName: string,
  ): Promise<void> {
    if (claimed.length === 0) {
      this.logger.log(`No statements to process for ${operationName}.`);
      return;
    }

    const idsByUserCurrency = new Map<string, string[]>();

    for (const r of claimed) {
      if (!r?.userId || !r?.id || !r?.currency) continue;
      const key = makeKey(r.userId, r.currency);
      const list = idsByUserCurrency.get(key) ?? [];
      list.push(r.id);
      idsByUserCurrency.set(key, list);
    }

    this.logger.log(
      `Grouped into ${idsByUserCurrency.size} user/currency combinations for ${operationName}`,
    );

    // Process each user/currency group
    for (const [userCurrencyKey, ids] of idsByUserCurrency) {
      const [userId, currency] = parseKey(userCurrencyKey);
      try {
        const statements = await this.dataSource
          .getRepository(PaymentStatement)
          .find({
            where: { id: In(ids) },
            relations: { user: true, items: { order: true } },
            order: { createdAt: 'ASC', id: 'ASC' },
          });

        if (!statements.length) {
          this.logger.warn(
            `User ${userId} (${currency}): no statements found after claim; skipping`,
          );
          continue;
        }

        const [primary, ...additional] = statements;

        const invoice = await this.createInvoiceService.execute(
          primary,
          additional,
        );

        await this.dataSource.transaction(async (m) => {
          await m
            .createQueryBuilder()
            .update(PaymentStatement)
            .set({
              invoiceId: invoice.id as string,
              invoiceNumber: invoice.number as string,
              invoiceUrl: invoice.hosted_invoice_url as string,
              invoiceStatus: invoice.status as string,
              invoicePdf:
                invoice.invoice_pdf && typeof invoice.invoice_pdf === 'string'
                  ? invoice.invoice_pdf
                  : null,
              status: PaymentStatementStatus.Finalized,
            })
            .where('id IN (:...ids)', { ids })
            .andWhere('status = :processing', {
              processing: PaymentStatementStatus.Processing,
            })
            .execute();
        });

        this.logger.log(
          `User ${userId} (${currency}): finalized ${ids.length} statements -> invoice ${invoice.id} (${invoice.status})`,
        );
      } catch (err) {
        this.logger.error(
          `User ${userId} (${currency}) ${operationName} failed`,
          err as any,
        );

        await this.revertStatementsToOriginalStatus(ids);
      }
    }
  }

  protected async revertStatementsToOriginalStatus(
    ids: string[],
    originalStatus: PaymentStatementStatus = PaymentStatementStatus.Open,
  ): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .update(PaymentStatement)
      .set({
        status: originalStatus,
        attemptCount: () => 'attemptCount + 1',
        lastAttemptAt: () => 'SYSUTCDATETIME()',
        nextAttemptAt: () => `DATEADD(minute,
                     POWER(2, CASE WHEN attemptCount > 6 THEN 6 ELSE attemptCount END),
                     SYSUTCDATETIME())`,
      })
      .where('id IN (:...ids)', { ids })
      .andWhere('status = :processing', {
        processing: PaymentStatementStatus.Processing,
      })
      .execute();
  }
}
