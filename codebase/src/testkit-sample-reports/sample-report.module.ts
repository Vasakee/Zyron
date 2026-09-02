import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { VerifyTokenMiddleware } from '../common/middleware';
import { SentryInterceptor } from '../sentry/sentry.interceptor';
import { SampleReportService } from './services/sample-report.service';
import { SampleReportController } from './controllers/sample-report.controller';
import { SampleReportsListener } from '../helper/listeners/sample-reports';

@Module({
  imports: [
    TypeOrmModule.forFeature([SampleReportService]),
    
  ],
  controllers: [SampleReportController],
  providers: [SampleReportService, SentryInterceptor, SampleReportsListener],
  exports: [SampleReportService],
})
export class SampleReportModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyTokenMiddleware)
      .exclude({ path: 'sample-reports', method: RequestMethod.POST })
      .forRoutes('sample-reports*');
  }
}
