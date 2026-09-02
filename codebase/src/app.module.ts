import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PractitionerModule } from './practitioner/practitioner.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { dbconfig } from './config';
import { KitModule } from './kit/kit.module';
import { AuthModule } from './auth/auth.module';
import { SupportModule } from './support/support.module';
import { AdminModule } from './admin/admin.module';
import { TutorialModule } from './tutorials/tutorial.module';
import { ValidKitModule } from './validKit/valid-kit.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScriptsModule } from './scripts/scripts.module';
import { CronModule } from './cron/cron.module';
import { PaymentModule } from './payment/payment.module';
import { OrderModule } from './order/order.module';
import { FeedbackModule } from './feedback/feedback.module';
import { BullModule as BullModuleBull } from '@nestjs/bull';
import { MailModule } from './mail/mail.module';
import connection from './config/redis';
import { CommandModule } from './cli/command.module';
import { AuthExternalModule } from './auth-external/auth-external.module';
import { OrderExternalModule } from './order-external/order-external.module';
import { ContactMessageModule } from './contact-message/contact-message.module';
import { redisStore } from 'cache-manager-redis-yet';
import { HealthModule } from './health-info/health-info.module';
import { SampleReportModule } from './testkit-sample-reports/sample-report.module';
import { VaariModule } from './vaari/vaari.module';
import { QueueCoreModule } from './queues/queue-core.module';
import { QueueProcessorsModule } from './queues/queue-processors.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportingModule } from './reporting/reporting.module';
import { BillingModule } from './billing/billing.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 50 }],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [],
    }),
    TypeOrmModule.forRoot(dbconfig.getTypeOrmConfig()),
    BullModuleBull.forRoot({
      redis: {
        host: connection.host,
        port: connection.port,
        ...(connection.requiresPassword
          ? { password: connection.password }
          : {}),
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 200,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        ttl: 60,
        store: await redisStore({
          socket: {
            host: connection.host,
            port: connection.port,
          },
          ...(connection.requiresPassword
            ? { password: connection.password }
            : {}),
        }),
      }),
    }),
    UserModule,
    PractitionerModule,
    KitModule,
    PaymentModule,
    AuthModule,
    QueueCoreModule,
    SupportModule,
    AdminModule,
    TutorialModule,
    ValidKitModule,
    ScriptsModule,
    QueueProcessorsModule,
    OrderModule,
    FeedbackModule,
    MailModule,
    CommandModule,
    AuthExternalModule,
    OrderExternalModule,
    ContactMessageModule,
    HealthModule,
    SampleReportModule,
    VaariModule,
    DashboardModule,
    ReportingModule,
    BillingModule,
    CronModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
