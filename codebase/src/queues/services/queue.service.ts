import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, JobOptions } from 'bull';
import {
  QueueNames,
  JobTypes,
  TestReportJobData,
  UpsertCheckoutSessionsJobData,
  EnrichTransactionsJobData,
  ProcessPaymentMethodJobData,
  ProcessInvoicePaymentJobData,
  BillingAccessJobData,
  FixOrderPaymentUrlsJobData,
  SyncStripePricesJobData,
  AutoRegisterPractitionerOrderKitsJobData,
  HealthInformationDispatchJobData,
} from '../types/queue.types';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue(QueueNames.TEST)
    private readonly testQueue: Queue,
    @InjectQueue(QueueNames.STRIPE)
    private readonly stripeQueue: Queue,
    @InjectQueue(QueueNames.HEALTH)
    private readonly healthQueue: Queue,
    @InjectQueue(QueueNames.BILLING)
    private readonly billingQueue: Queue,
    @InjectQueue(QueueNames.BILLING_ACCESS)
    private readonly billingAccessQueue: Queue,
    @InjectQueue(QueueNames.KIT)
    private readonly kitQueue: Queue,
  ) {}

  async addTestReportJob(
    data?: TestReportJobData,
    options?: JobOptions,
  ): Promise<void> {
    try {
      await this.testQueue.add(JobTypes.TEST_REPORT, data, {
        priority: 10,
        delay: 0,
        ...options,
      });

      this.logger.log('Test report job added');
    } catch (error) {
      this.logger.error('Failed to add test report job', {
        error: error.message,
        data,
      });
      throw error;
    }
  }

  async addUpsertCheckoutSessionsJob(
    data?: UpsertCheckoutSessionsJobData,
    options?: JobOptions,
  ) {
    await this.stripeQueue.add(JobTypes.UPSERT_CHECKOUT_SESSIONS, data, {
      priority: 5,
      ...options,
    });
  }

  async addEnrichTransactionsJob(
    data?: EnrichTransactionsJobData,
    options?: JobOptions,
  ) {
    await this.stripeQueue.add(
      JobTypes.ENRICH_TRANSACTIONS_FROM_SESSIONS,
      data,
      { priority: 5, ...options },
    );
  }

  async addHealthInfoSyncJobDefault() {
    await this.healthQueue.add(JobTypes.HEALTH_INFO_SYNC, undefined, {
      priority: 5,
      jobId: 'cron:health-info-sync',
      removeOnComplete: 5,
      removeOnFail: 10,
    });
  }

  async addReconcileProcessingJob() {
    await this.billingQueue.add(
      JobTypes.RECONCILE_PROCESSING,
      { maxAgeMinutes: 30, userGroupLimit: 200 },
      {
        jobId: 'cron:reconcile-processing',
        removeOnComplete: 5,
        removeOnFail: 50,
      },
    );
  }

  async addProcessPaymentMethodJob(
    data: ProcessPaymentMethodJobData,
    options?: JobOptions,
  ): Promise<void> {
    try {
      await this.stripeQueue.add(JobTypes.PROCESS_PAYMENT_METHOD, data, {
        priority: 8,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 5,
        removeOnFail: 10,
        ...options,
      });

      this.logger.log('Payment method processing job added', {
        sessionId: data.sessionId,
      });
    } catch (error) {
      this.logger.error('Failed to add payment method processing job', {
        error: error.message,
        data,
      });
      throw error;
    }
  }

  async addProcessInvoicePaymentJob(
    data: ProcessInvoicePaymentJobData,
    options?: JobOptions,
  ): Promise<void> {
    try {
      await this.billingQueue.add(JobTypes.PROCESS_INVOICE_PAYMENT, data, {
        priority: 9,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 5,
        removeOnFail: 10,
        ...options,
      });

      this.logger.log('Invoice payment processing job added', {
        invoiceId: data.invoice.id,
      });
    } catch (error) {
      this.logger.error('Failed to add invoice payment processing job', {
        error: error.message,
        invoiceId: data.invoice.id,
      });
      throw error;
    }
  }

  async addBillingAccessJob(
    data: BillingAccessJobData,
    options?: JobOptions,
  ): Promise<void> {
    try {
      await this.billingAccessQueue.add(
        JobTypes.PROCESS_BILLING_ACCESS_FILE,
        data,
        {
          priority: 7,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 5,
          removeOnFail: 10,
          ...options,
        },
      );

      this.logger.log('Billing access job added', {
        emailCount: data.emails.length,
        enable: data.enable,
      });
    } catch (error) {
      this.logger.error('Failed to add billing access job', {
        error: error.message,
        data,
      });
      throw error;
    }
  }

  async addFixOrderPaymentUrlsJob(
    data?: FixOrderPaymentUrlsJobData,
    options?: JobOptions,
  ) {
    await this.stripeQueue.add(JobTypes.FIX_ORDER_PAYMENT_URLS, data, {
      priority: 5,
      ...options,
    });
  }

  async addSyncStripePricesJob(
    data?: SyncStripePricesJobData,
    options?: JobOptions,
  ) {
    await this.stripeQueue.add(JobTypes.SYNC_STRIPE_PRICES, data, {
      priority: 5,
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      ...options,
    });
  }

  async addAutoRegisterPractitionerOrderKitsJob(
    data: AutoRegisterPractitionerOrderKitsJobData,
    options?: JobOptions,
  ): Promise<void> {
    try {
      await this.kitQueue.add(
        JobTypes.AUTO_REGISTER_PRACTITIONER_ORDER_KITS,
        data,
        {
          priority: 8,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 5,
          removeOnFail: 10,
          ...options,
        },
      );

      this.logger.log('Auto register practitioner order kits job added', {
        orderId: data.orderId,
        kitId: data.kitId,
      });
    } catch (error) {
      this.logger.error(
        'Failed to add auto register practitioner order kits job',
        {
          error: error.message,
          data,
        },
      );
      throw error;
    }
  }

  async addAutoRegisterPractitionerOrderKitsJobsBulk(
    data: AutoRegisterPractitionerOrderKitsJobData[],
    options?: JobOptions,
  ) {
    try {
      const jobs = data.map((d) => ({
        name: JobTypes.AUTO_REGISTER_PRACTITIONER_ORDER_KITS,
        data: d,
        opts: {
          priority: 8,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 5,
          removeOnFail: 10,
          ...options,
        },
      }));

      await this.kitQueue.addBulk(jobs);

      this.logger.log('Auto register practitioner order kits jobs added bulk', {
        count: data.length,
      });
    } catch (error) {
      this.logger.error(
        'Failed to add auto register practitioner order kits jobs bulk',
        {
          error: error.message,
          count: data.length,
        },
      );
      throw error;
    }
  }

  async addHealthInformationDispatchJob(
    data: HealthInformationDispatchJobData,
    options?: JobOptions,
  ): Promise<void> {
    try {
      await this.kitQueue.add(JobTypes.HEALTH_INFORMATION_DISPATCH, data, {
        priority: 8,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 5,
        removeOnFail: 10,
        ...options,
      });

      this.logger.log('Health information dispatch job added', {
        logId: data.logId,
      });
    } catch (error) {
      this.logger.error('Failed to add health information dispatch job', {
        error: error.message,
        data,
      });
      throw error;
    }
  }

  async getQueueStats(): Promise<any> {
    try {
      const [
        testStats,
        stripeStats,
        healthStats,
        billingStats,
        billingAccessStats,
        kitStats,
      ] = await Promise.all([
        this.getQueueInfo(this.testQueue, 'Test'),
        this.getQueueInfo(this.stripeQueue, 'Stripe'),
        this.getQueueInfo(this.healthQueue, 'Health'),
        this.getQueueInfo(this.billingQueue, 'Billing'),
        this.getQueueInfo(this.billingAccessQueue, 'Billing Access'),
        this.getQueueInfo(this.kitQueue, 'Kit'),
      ]);

      return {
        test: testStats,
        stripe: stripeStats,
        health: healthStats,
        billing: billingStats,
        billingAccess: billingAccessStats,
        kit: kitStats,
      };
    } catch (error) {
      this.logger.error('Failed to get queue stats', { error: error.message });
      throw error;
    }
  }

  private async getQueueInfo(queue: Queue, name: string) {
    const counts = await queue.getJobCounts();

    return {
      name,
      waiting: counts.waiting ?? 0,
      active: counts.active ?? 0,
      completed: counts.completed ?? 0,
      failed: counts.failed ?? 0,
      delayed: counts.delayed ?? 0,
    };
  }

  async pauseQueue(queueName: QueueNames): Promise<void> {
    const queue = this.getQueueByName(queueName);
    await queue.pause();
    this.logger.log(`Queue ${queueName} paused`);
  }

  async resumeQueue(queueName: QueueNames): Promise<void> {
    const queue = this.getQueueByName(queueName);
    await queue.resume();
    this.logger.log(`Queue ${queueName} resumed`);
  }

  async enqueueIfIdle(
    queue: Queue,
    jobName: string,
    jobId: string,
    data?: any,
    opts?: JobOptions,
  ) {
    const existing = await queue.getJob(jobId);
    if (existing) return;
    await queue.add(jobName, data, { jobId, ...opts });
  }

  private getQueueByName(queueName: QueueNames): Queue {
    switch (queueName) {
      case QueueNames.TEST:
        return this.testQueue;
      case QueueNames.STRIPE:
        return this.stripeQueue;
      case QueueNames.HEALTH:
        return this.healthQueue;
      case QueueNames.BILLING:
        return this.billingQueue;
      case QueueNames.BILLING_ACCESS:
        return this.billingAccessQueue;
      case QueueNames.KIT:
        return this.kitQueue;
      default:
        throw new Error(`Unknown queue: ${queueName}`);
    }
  }
}
