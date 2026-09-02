import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingSchedulerService } from './services/billing-scheduler.service';
import { MonthlyBillingService } from './services/monthly-billing.service';
import { PaymentRetryService } from './services/payment-retry.service';
import { PaymentStatement } from 'src/payment/entity/payment-statement.entity';
import { PaymentStatementItem } from 'src/payment/entity/payment-statement-item.entity';
import { Transaction } from 'src/payment/entity/transaction.entity';
import { User } from 'src/user/entity/user.entity';
import { Order } from 'src/order/entity/order.entity';
import { PaymentMethod } from 'src/payment/entity/payment-method.entity';
import { PaymentModule } from 'src/payment/payment.module';
import { ProcessOpenStatementsService } from './services/process-open-statements.service';

@Module({
  imports: [
    PaymentModule,
    TypeOrmModule.forFeature([
      PaymentStatement,
      PaymentStatementItem,
      Transaction,
      User,
      Order,
      PaymentMethod,
    ]),
  ],
  providers: [
    BillingSchedulerService,
    MonthlyBillingService,
    PaymentRetryService,
    ProcessOpenStatementsService,
  ],
  exports: [
    BillingSchedulerService,
    MonthlyBillingService,
    PaymentRetryService,
    ProcessOpenStatementsService,
  ],
})
export class BillingModule {}
