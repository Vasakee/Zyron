import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ScheduleService } from './cron.service';
import { ShotgunWaitlist } from 'src/order/entity/shotgun-waitlist.entity';
import { Order } from 'src/order/entity/order.entity';
import { ReminderService } from 'src/order/service/waitlist-reminder';
import { Reminder } from 'src/reminders/entity/reminder.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingModule } from 'src/billing/billing.module';
import { PaymentModule } from 'src/payment/payment.module';

import { PaymentMethod } from 'src/payment/entity/payment-method.entity';
import { PaymentStatement } from 'src/payment/entity/payment-statement.entity';
import { PaymentStatementItem } from 'src/payment/entity/payment-statement-item.entity';
import { Transaction } from 'src/payment/entity/transaction.entity';
import { HealthModule } from 'src/health-info/health-info.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PaymentModule,
    BillingModule,
    HealthModule,
    TypeOrmModule.forFeature([
      Order,
      ShotgunWaitlist,
      Reminder,
      PaymentMethod,
      PaymentStatement,
      PaymentStatementItem,
      Transaction,
    ]),
  ],
  providers: [ScheduleService, ReminderService],
})
export class CronModule {}
