import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { VerifyTokenMiddleware } from 'src/common/middleware';
import { FeedbackController } from './feedback.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Feedback } from './entity/feedback.entity';
import { SentryInterceptor } from 'src/sentry/sentry.interceptor';
import { CreateFeedbackService } from './service/create-feedback';
import { GetAllFeedbackService } from './service/get-feedback';
import { FeedbackCodeListener } from 'src/helper/listeners/feedback-code';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback])],
  controllers: [FeedbackController],
  providers: [CreateFeedbackService, GetAllFeedbackService, SentryInterceptor, FeedbackCodeListener],
})
export class FeedbackModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}
