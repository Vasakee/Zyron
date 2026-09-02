import { Injectable, Logger } from '@nestjs/common';
import { DateTime } from 'luxon';
import { PaymentStatementStatus } from 'src/enum';
import { SYSTEM_TIME_ZONE } from 'src/config';
import { BaseBillingService } from './base-billing.service';

@Injectable()
export class MonthlyBillingService extends BaseBillingService {
  protected readonly logger = new Logger(MonthlyBillingService.name);

  async processBillingDay(): Promise<void> {
    const bizDay = DateTime.now().setZone(SYSTEM_TIME_ZONE).startOf('day');
    const bizDateISO = bizDay.toISODate();

    this.logger.log(
      `Processing billing for tz=${SYSTEM_TIME_ZONE} day=${bizDateISO} (date equality match)`,
    );

    const claimed = await this.claimStatements(
      PaymentStatementStatus.Open,
      [`ps.periodEnd = CAST(@3 AS date)`],
      [bizDateISO],
    );

    await this.processClaimedStatements(claimed, `billing for ${bizDateISO}`);
  }
}
