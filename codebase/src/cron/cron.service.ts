import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BillingSchedulerService } from 'src/billing/services/billing-scheduler.service';
import { QueueService } from 'src/queues/services/queue.service';
import { MONTHLY_BILLING_CRON } from 'src/config/keys';
import { DispatchHealthInformationService } from 'src/health-info/services/dispatch-health-information';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);
  constructor(
    private readonly billingSchedulerService: BillingSchedulerService,
    private readonly queueService: QueueService,
    private readonly dispatchHealthInformationService: DispatchHealthInformationService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleEveryHourTasks() {
    this.logger.log('Running tasks every hour...');
    await this.queueService.addReconcileProcessingJob();
    this.logger.log('Hourly tasks completed.');
  }

  @Cron(
    MONTHLY_BILLING_CRON && MONTHLY_BILLING_CRON.trim()
      ? MONTHLY_BILLING_CRON.trim()
      : '0 */2 25-28 * *',
  )
  async handleMonthlyBillingTasks() {
    console.log('CRON JOB TRIGGERED');
    try {
      this.logger.log('Running monthly billing tasks...');
      await this.billingSchedulerService.execute();
      this.logger.log('Monthly billing tasks completed.');
    } catch (error) {
      this.logger.error(error);
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleHealthInfoSync() {
    try {
      this.logger.log('Running health info sync job...');
      await this.queueService.addHealthInfoSyncJobDefault();
      this.logger.log('Health info sync job enqueued successfully.');
    } catch (error) {
      this.logger.error('Error enqueueing health info sync job:', error);
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleHealthInformationDispatch() {
    try {
      this.logger.log('Checking for pending health information dispatches...');
      await this.dispatchHealthInformationService.execute();
    } catch (error) {
      this.logger.error('Error in handleHealthInformationDispatch:', error);
    }
  }
}
