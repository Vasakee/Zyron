import { Injectable, Logger } from '@nestjs/common';
import { DateTime } from 'luxon';
import { PaymentStatementStatus } from 'src/enum';
import { BaseBillingService } from './base-billing.service';
import { BILLING_PERIOD_START_DAY, BILLING_PERIOD_END_DAY } from 'src/config';

@Injectable()
export class ProcessOpenStatementsService extends BaseBillingService {
  protected readonly logger = new Logger(ProcessOpenStatementsService.name);

  private getCurrentBillingWindowEnd(now: DateTime): string {
    const startDay = parseInt(BILLING_PERIOD_START_DAY || '26', 10);
    const endDay = parseInt(BILLING_PERIOD_END_DAY || '25', 10);

    // Current billing window end date
    const currentEnd =
      now.day >= startDay
        ? now.plus({ months: 1 }).set({ day: endDay })
        : now.set({ day: endDay });

    return currentEnd.toISODate();
  }

  async execute(bizDay: DateTime): Promise<void> {
    const currentEnd = this.getCurrentBillingWindowEnd(bizDay);

    this.logger.log(
      `Processing Open statements for billing window up to: ${currentEnd}`,
    );

    const claimed = await this.claimStatements(
      PaymentStatementStatus.Open,
      [`ps.periodEnd <= CAST(@3 AS date)`],
      [currentEnd],
    );

    await this.processClaimedStatements(claimed, 'Open statement billing');
  }
}
