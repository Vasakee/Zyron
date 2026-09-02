import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueCoreModule } from './queue-core.module';
import { QueueController } from './controllers/queue.controller';
import { JobController } from './controllers/job.controller';
import { TestReportProcessor } from './processors/test.processor';
import { StripeEnrichTransactionsProcessor } from './processors/stripe-enrich-transactions.processor';
import { StripeUpsertSessionsProcessor } from './processors/stripe-upsert-sessions.processor';
import { HealthInfoSyncProcessor } from './processors/health-info-sync.processor';
import { VitractHealthInfoClient } from 'src/integrations/health-info.client';
import { ReconcileProcessingStatementsService } from './services/reconcile-processing-statements.service';
import { ReconcileProcessingStatementsProcessor } from './processors/reconcile-processing-statements.processor';
import { ProcessPaymentMethodProcessor } from './processors/process-payment-method.processor';
import { ProcessInvoicePaymentProcessor } from './processors/process-invoice-payment.processor';
import { BillingAccessProcessor } from './processors/billing-access.processor';
import { PaymentModule } from 'src/payment/payment.module';
import { StripeFixOrderPaymentUrlsProcessor } from './processors/stripe-fix-order-payment-urls.processor';
import { HealthInformationDispatchLog } from 'src/health-info/entity/health-information-dispatch-log.entity';
import { AutoRegisterPractitionerOrderKitsProcessor } from './processors/auto-register.processor';
import { HealthInformationDispatchProcessor } from './processors/health-info-dispatch.processor';
import { StripeCheckoutSession } from 'src/payment/entity/stripe-checkout-session.entity';
import { Transaction } from 'src/payment/entity/transaction.entity';
import { Kit } from 'src/kit/entity/kit.entity';
import { PractitionerKit } from 'src/kit/entity/practitioner-kits.entity';
import { User } from 'src/user/entity/user.entity';
import { Order } from 'src/order/entity/order.entity';
import { StripePrice } from 'src/payment/entity/stripe-price.entity';
import { StripeSyncPricesProcessor } from './processors/stripe-sync-prices.processor';
import { RegisterPractitionerKitService } from 'src/kit/service/register-practitioner-kit';

@Module({
  imports: [
    QueueCoreModule,
    PaymentModule,
    TypeOrmModule.forFeature([
      StripeCheckoutSession,
      Transaction,
      Kit,
      PractitionerKit,
      User,
      Order,
      HealthInformationDispatchLog,
      StripePrice,
    ]),
  ],
  controllers: [QueueController, JobController],
  providers: [
    TestReportProcessor,
    StripeEnrichTransactionsProcessor,
    StripeUpsertSessionsProcessor,
    HealthInfoSyncProcessor,
    VitractHealthInfoClient,
    ReconcileProcessingStatementsService,
    ReconcileProcessingStatementsProcessor,
    ProcessPaymentMethodProcessor,
    ProcessInvoicePaymentProcessor,
    BillingAccessProcessor,
    StripeFixOrderPaymentUrlsProcessor,
    AutoRegisterPractitionerOrderKitsProcessor,
    HealthInformationDispatchProcessor,
    StripeSyncPricesProcessor,
    RegisterPractitionerKitService,
  ],
})
export class QueueProcessorsModule {}
