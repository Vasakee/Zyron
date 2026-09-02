import { Controller, Get, Query } from '@nestjs/common';
import { QueueService } from '../services/queue.service';
import { ApiTags } from '@nestjs/swagger';
import { StripeUpsertSessionsQueryDto } from '../dto/stripe-upsert-sessions.dto';
import { FixOrderPaymentUrlsQueryDto } from '../dto/fix-order-payment-urls.dto';
import { AutoRegisterPractitionerOrderKitsQueryDto } from '../dto/auto-register-practitioner-order-kits.dto';

@ApiTags('Jobs')
@Controller('jobs/run')
export class JobController {
  constructor(private readonly queueService: QueueService) { }

  @Get('test')
  async runTestJob() {
    await this.queueService.addTestReportJob();

    return { message: 'Test job has been added to the queue' };
  }

  @Get('stripe-upsert-sessions')
  async upsertSessions(@Query() query: StripeUpsertSessionsQueryDto) {
    await this.queueService.addUpsertCheckoutSessionsJob({
      createdFrom: query.createdFrom,
      createdTo: query.createdTo,
    });
    return { message: 'Stripe upsert sessions job enqueued' };
  }

  @Get('stripe-enrich-transactions')
  async enrichTransactions() {
    await this.queueService.addEnrichTransactionsJob();
    return { message: 'Stripe enrich transactions job enqueued' };
  }

  @Get('stripe-fix-order-payment-urls')
  async fixOrderPaymentUrls(@Query() query: FixOrderPaymentUrlsQueryDto) {
    await this.queueService.addFixOrderPaymentUrlsJob({
      batchSize: query.batchSize,
    });
    return { message: 'Fix order payment URLs job enqueued' };
  }

  @Get('health-info-sync')
  async healthInfoSync() {
    await this.queueService.addHealthInfoSyncJobDefault();
    return { message: 'Health info sync job enqueued' };
  }

  @Get('auto-register-practitioner-order-kits')
  async autoRegisterPractitionerOrderKits(
    @Query() query: AutoRegisterPractitionerOrderKitsQueryDto,
  ) {
    await this.queueService.addAutoRegisterPractitionerOrderKitsJob({
      orderId: query.orderId,
      kitId: query.kitId,
    });
    return {
      message: 'Auto register practitioner order kits job enqueued',
    };
  }
}
