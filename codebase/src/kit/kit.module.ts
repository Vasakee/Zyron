import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { VerifyTokenMiddleware } from 'src/common/middleware';
import { KitController } from './kit.controller';
import { CreateKitService } from './service/create-kit';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Kit } from './entity/kit.entity';
import { GetUserKitService } from './service/get-clients-kits';
import { GetSingleKitService } from './service/get-single-kit';
import { DeleteKitService } from './service/delete-kit';
import { UpdateKitStatusService } from './service/update-kit-status';
import { UpdateKitLockStatusService } from './service/toggle-kit';
import { Practitioner } from 'src/practitioner/entity/practitioner.entity';
import { GetPractitionerKitService } from './service/get-practitioner-kits';
import { User } from 'src/user/entity/user.entity';
import { UpdateKitService } from './service/update-kit';
import { SentryInterceptor } from '../sentry/sentry.interceptor';
import { GetFamilyKitService } from './service/get-family-kits';
import { FamilyKit } from './entity/family-kit.entity';
import { PractitionerKit } from './entity/practitioner-kits.entity';
import { GetOldPractitionerKitService } from './service/get-old-practitioner-kits';
import { ValidKit } from 'src/validKit/entity/valid-kit.entity';
import { GetNameWithKitIDService } from './service/get-name-with-kitId';
import { CompleteReportProcessService } from './service/complete-report-process';
import { ProcessingKitListener } from 'src/helper/listeners/processing-kit-status';
import { ReceivedKitListener } from 'src/helper/listeners/received-kit-status';
import { ResultReadyListener } from 'src/helper/listeners/result-ready';
import { RegisterPractitionerKitService } from './service/register-practitioner-kit';
import { UpdatePractitionerKitStatusService } from './service/update-practitioner-kit-status';
import { UpdatePractitionerKitNameService } from './service/update-practitioner-kit-name.service';
import { GetAllKitService } from './service/get-kits';
import { GetAllPractitionerKitService } from './service/get-kits-with-practitioner';
import { ClientPractitioner } from 'src/practitioner/entity/client-practitioner.entity';
import { GenerateKitService } from './service/generate-kit';
import { GeneratedKit } from './entity/genrated-kit.entity';
import { Order } from 'src/order/entity/order.entity';
import { HealthInfoCompletedListener } from 'src/helper/listeners/health-info-completed';
import { ApiKeyMiddleware } from 'src/common/middleware/api-key.middleware';
import { UpdateKitStatusExternalService } from './service/update-kit-status-external';
import { UpdateDateOfSampleCollectionService } from './service/update-date-of-sample-collection';
import { TransferKitService } from './service/transfer-kit';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { EnqueueHealthInfoDispatchService } from './service/enqueue-health-info-dispatch';
import { OrderKit } from 'src/order/entity/order-kit.entity';
import { HealthInformationDispatchLog } from 'src/health-info/entity/health-information-dispatch-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Kit,
      Practitioner,
      User,
      FamilyKit,
      PractitionerKit,
      ValidKit,
      ClientPractitioner,
      GeneratedKit,
      Order,
      OrderKit,
      HealthInformationDispatchLog,
    ]),
    
  ],
  controllers: [KitController],
  providers: [
    CreateKitService,
    GetUserKitService,
    GetSingleKitService,
    DeleteKitService,
    UpdateKitStatusService,
    UpdateKitLockStatusService,
    GetAllKitService,
    GetPractitionerKitService,
    UpdateKitService,
    GetFamilyKitService,
    GetOldPractitionerKitService,
    GetNameWithKitIDService,
    CompleteReportProcessService,
    RegisterPractitionerKitService,
    UpdatePractitionerKitStatusService,
    UpdatePractitionerKitNameService,
    SentryInterceptor,
    ProcessingKitListener,
    ReceivedKitListener,
    ResultReadyListener,
    GetAllPractitionerKitService,
    GenerateKitService,
    HealthInfoCompletedListener,
    UpdateKitStatusExternalService,
    UpdateDateOfSampleCollectionService,
    TransferKitService,
    EnqueueHealthInfoDispatchService,
    RolesGuard,
  ],
  exports: [GenerateKitService, RegisterPractitionerKitService],
})
export class KitModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyTokenMiddleware)
      .exclude(
        { path: 'kits/get-name/:kitId', method: RequestMethod.GET },
        { path: 'kits/process-temp', method: RequestMethod.GET },
        { path: 'kits/singlekit/:id', method: RequestMethod.GET },
        { path: 'kits/status/:kitId', method: RequestMethod.PUT },
        {
          path: 'kits/external/status/:kitId',
          method: RequestMethod.PUT,
        },
        { path: 'kits/complete-process/:kitId', method: RequestMethod.PUT },
        { path: 'kits/practitioner-status/:kitId', method: RequestMethod.PUT },
        { path: 'kits/transfer', method: RequestMethod.POST },
      )
      .forRoutes('kit*');
    consumer.apply(ApiKeyMiddleware).forRoutes({
      path: 'kits/external/status/:kitId',
      method: RequestMethod.PUT,
    });
  }
}
