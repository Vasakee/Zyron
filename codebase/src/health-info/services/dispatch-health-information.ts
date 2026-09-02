import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DispatchStatus } from 'src/enum';
import { QueueService } from 'src/queues/services/queue.service';

@Injectable()
export class DispatchHealthInformationService {
  private readonly logger = new Logger(DispatchHealthInformationService.name);
  private readonly defaultCutoffMinutes = 24 * 60;

  constructor(
    private readonly queueService: QueueService,
    private readonly dataSource: DataSource,
  ) {}

  async execute(options?: {
    batchSize?: number;
    enqueueConcurrency?: number;
    maxAttempts?: number;
    retryCooldownMinutes?: number;
  }): Promise<void> {
    const batchSize = options?.batchSize ?? 500;
    const enqueueConcurrency = options?.enqueueConcurrency ?? 15;
    const maxAttempts = options?.maxAttempts ?? 10;
    const retryCooldownMinutes = options?.retryCooldownMinutes ?? 15;

    const claimedIds = await this.claimPendingAndFailedLogs({
      batchSize,
      maxAttempts,
      retryCooldownMinutes,
    });

    this.logger.log(
      `Claimed ${claimedIds.length} logs to enqueue (UTC cutoff).`,
    );
    if (claimedIds.length === 0) return;

    const failedToEnqueue: string[] = [];

    await this.runWithConcurrency(
      [...claimedIds],
      enqueueConcurrency,
      async (logId) => {
        try {
          await this.queueService.addHealthInformationDispatchJob({ logId });
        } catch (err: any) {
          failedToEnqueue.push(logId);
          this.logger.error(`Failed to enqueue job for log ${logId}`, err);
        }
      },
    );

    if (failedToEnqueue.length > 0) {
      await this.revertQueuedToPending(failedToEnqueue);
      this.logger.warn(
        `Reverted ${failedToEnqueue.length} logs back to PENDING due to enqueue failure.`,
      );
    }

    this.logger.log(
      `Enqueue done. Success=${
        claimedIds.length - failedToEnqueue.length
      }, Failed=${failedToEnqueue.length}.`,
    );
  }

  private async claimPendingAndFailedLogs(args: {
    batchSize: number;
    maxAttempts: number;
    retryCooldownMinutes: number;
  }): Promise<string[]> {
    const safeBatch =
      Number.isFinite(args.batchSize) && args.batchSize > 0
        ? Math.floor(args.batchSize)
        : 500;

    const safeMaxAttempts =
      Number.isFinite(args.maxAttempts) && args.maxAttempts > 0
        ? Math.floor(args.maxAttempts)
        : 10;

    const safeCooldown =
      Number.isFinite(args.retryCooldownMinutes) &&
      args.retryCooldownMinutes >= 0
        ? Math.floor(args.retryCooldownMinutes)
        : 15;

    const safeCutoffMinutes = this.getCutoffMinutes();

    const sql = `
      SET NOCOUNT ON;

      DECLARE @nowUtc DATETIME2 = SYSUTCDATETIME();
      DECLARE @cutoffUtc DATETIME2 = DATEADD(MINUTE, -${safeCutoffMinutes}, @nowUtc);
      DECLARE @failedCooldownUtc DATETIME2 = DATEADD(MINUTE, -${safeCooldown}, @nowUtc);

      DECLARE @claimed TABLE (id UNIQUEIDENTIFIER);

      ;WITH cte AS (
        SELECT TOP (${safeBatch}) l.id
        FROM health_information_dispatch_logs l WITH (READPAST, UPDLOCK, ROWLOCK)
        WHERE
          (
            l.status = @0
            AND l.registeredAt <= @cutoffUtc
          )
          OR
          (
            l.status = @1
            AND l.attempts < ${safeMaxAttempts}
            AND l.lastAttemptedAt IS NOT NULL
            AND l.lastAttemptedAt <= @failedCooldownUtc
          )
        ORDER BY l.registeredAt ASC
      )
      UPDATE l
        SET l.status = @2
      OUTPUT INSERTED.id INTO @claimed(id)
      FROM health_information_dispatch_logs l
      INNER JOIN cte ON cte.id = l.id;

      SELECT id FROM @claimed;
    `;

    const rows = (await this.dataSource.query(sql, [
      DispatchStatus.PENDING,
      DispatchStatus.FAILED,
      DispatchStatus.QUEUED,
    ])) as Array<{ id: string }>;

    return rows.map((r) => r.id);
  }

  private getCutoffMinutes(): number {
    const raw = process.env.HEALTH_INFO_DISPATCH_CUTOFF?.trim();
    if (!raw) return this.defaultCutoffMinutes;

    const match = raw.match(/^(\d+)\s*([dhm])$/i);
    if (!match) return this.defaultCutoffMinutes;

    const value = Number(match[1]);
    if (!Number.isFinite(value) || value <= 0) {
      return this.defaultCutoffMinutes;
    }

    const unit = match[2].toLowerCase();
    const minutesPerUnit = unit === 'd' ? 24 * 60 : unit === 'h' ? 60 : 1;

    if (!minutesPerUnit) return this.defaultCutoffMinutes;
    return Math.floor(value * minutesPerUnit);
  }

  private async revertQueuedToPending(logIds: string[]): Promise<void> {
    const chunkSize = 500;

    for (let i = 0; i < logIds.length; i += chunkSize) {
      const chunk = logIds.slice(i, i + chunkSize);

      const placeholders = chunk
        .map((_, index) => `@${index + 2}`)
        .join(', ');
      const sql = `
        UPDATE health_information_dispatch_logs
        SET status = @0
        WHERE status = @1
          AND id IN (${placeholders});
      `;

      await this.dataSource.query(sql, [
        DispatchStatus.PENDING,
        DispatchStatus.QUEUED,
        ...chunk,
      ]);
    }
  }

  private async runWithConcurrency<T>(
    items: T[],
    concurrency: number,
    fn: (item: T) => Promise<void>,
  ): Promise<void> {
    const workerCount = Math.max(1, concurrency);

    const workers = Array.from({ length: workerCount }, async () => {
      while (items.length > 0) {
        const item = items.shift();
        if (item === undefined) return;
        await fn(item);
      }
    });

    await Promise.all(workers);
  }
}
