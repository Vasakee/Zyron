import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SentryInterceptor } from 'src/sentry/sentry.interceptor';
import { HealthInfoController } from './health-info.controller';
import { AddQuestionResponseService } from './services/add-question-response';
import { GetUserResponseService } from './services/get-response';
import { SetSubmittedService } from './services/set-submitted';
import { QuestionnaireResponseCacheService } from 'src/database/cache/response';
import { SetAgreementService } from './services/set-agreement';
import { HealthInfoGateway } from './health-info.gateway';
import { HealthInfoSseBus } from './health-info-sse.bus';
import { HealthInfoSseController } from './health-info-sse.controller';
import { DispatchHealthInformationService } from './services/dispatch-health-information';
import { HealthInformationDispatchLog } from './entity/health-information-dispatch-log.entity';
import { HealthInfoDispatchListener } from 'src/helper/listeners/health-info-dispatch';

@Module({
  imports: [TypeOrmModule.forFeature([HealthInformationDispatchLog])],
  controllers: [HealthInfoController, HealthInfoSseController],
  providers: [
    AddQuestionResponseService,
    GetUserResponseService,
    SetSubmittedService,
    SetAgreementService,
    SentryInterceptor,
    QuestionnaireResponseCacheService,
    HealthInfoGateway,
    HealthInfoSseBus,
    DispatchHealthInformationService,
    HealthInfoDispatchListener,
  ],
  exports: [DispatchHealthInformationService],
})
export class HealthModule {}
