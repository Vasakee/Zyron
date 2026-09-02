import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { VerifyTokenMiddleware } from 'src/common/middleware';
import { TutorialsController } from './tutorial.controller';
import { UploadTutorialService } from './service/upload-tutorial';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Tutorials } from './entity/tutorial.entity';
import { Practitioner } from 'src/practitioner/entity/practitioner.entity';
import { GetSingleTutorialsService } from './service/get-single-tutorial';
import { DeleteTutorialsService } from './service/delete-tutorial';
import { UpdateTutorialStatusService } from './service/update-tutorial';
import { GetAllTutorialService } from './service/get-tutorials';
import { S3BucketService } from 'src/aws/services/s3-bucket.service';
import { SentryInterceptor } from 'src/sentry/sentry.interceptor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tutorials, Practitioner]),
    
  ],
  controllers: [TutorialsController],
  providers: [
    UploadTutorialService,
    GetSingleTutorialsService,
    DeleteTutorialsService,
    UpdateTutorialStatusService,
    GetAllTutorialService,
    S3BucketService,
    SentryInterceptor,
  ],
})
export class TutorialModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyTokenMiddleware)
      .exclude(
        { path: 'tutorials/all', method: RequestMethod.GET },
        { path: 'tutorials', method: RequestMethod.POST },

        { path: 'tutorials/:id', method: RequestMethod.PATCH },
      )
      .forRoutes('tutorials*');
  }
}