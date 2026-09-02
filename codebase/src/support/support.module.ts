import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { VerifyTokenMiddleware } from 'src/common/middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Support } from './entity/support.entity';
import { SupportController } from './support.controller';
import { CreateCaseService } from './services/create-case';
import { GetCaseService } from './services/get-case';
import { SupportInitialResponseListener } from 'src/helper/listeners/support-initial-response';
import { User } from 'src/user/entity/user.entity';
import { UpdateCaseStatusService } from './services/update-case-status';
import { AssignCaseStatusService } from './services/assign-case-status ';
import { NotifyAdminListener } from 'src/helper/listeners/notify-admin';
import { SentryInterceptor } from 'src/sentry/sentry.interceptor';
import { MailModule } from 'src/mail/mail.module';
import { SendMessageService } from './services/send-message';
import { SupportMessage } from './entity/support-message.entity';
import { SupportResponseListener } from 'src/helper/listeners/support-response';
import { GetSingleCaseService } from './services/get-single-case';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    TypeOrmModule.forFeature([Support, SupportMessage, User]),

    MailModule,
    BullModule.registerQueue({
      name: 'mail',
    }),
  ],
  controllers: [SupportController],
  providers: [
    CreateCaseService,
    GetCaseService,
    GetSingleCaseService,
    SupportInitialResponseListener,
    SupportResponseListener,
    UpdateCaseStatusService,
    AssignCaseStatusService,
    NotifyAdminListener,
    SentryInterceptor,
    SendMessageService,
  ],
})
export class SupportModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(VerifyTokenMiddleware).forRoutes(SupportController);
  }
}
