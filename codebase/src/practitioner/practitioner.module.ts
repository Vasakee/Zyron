import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { VerifyTokenMiddleware } from 'src/common/middleware';
import { PractitionerController } from './practitioner.controller';
import { CreatePractitionerAccountService } from './service/create-practitioner-account';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Practitioner } from './entity/practitioner.entity';
import { VerifyAccountListener } from 'src/helper/listeners/verify-account';
import { GetAllPractitionerProfileService } from './service/get-practitioners';
import { UpdatePractitionerAccountService } from './service/update-practitioner-account';
import { CreateClientService } from './service/create-client';
import { User } from 'src/user/entity/user.entity';
import { NewPractitionerListener } from 'src/helper/listeners/newPractitioner';
import { UpdatePractitionerStatusService } from './service/update-practitioner-account-status';
import { CreateBulkPractitionerAccountService } from './service/create_bulk_practitioner';
import { CompleteRegistrationListener } from 'src/helper/listeners/complete-registration';
import { ExternalPractitioner } from './entity/external-practitioner.entity';
import { UpdatePractitionerAccountIdService } from './service/update-practitioner-account-with-id';
import { ClientPractitioner } from './entity/client-practitioner.entity';
import { SentryInterceptor } from 'src/sentry/sentry.interceptor';
import { AcceptPractitionerListener } from 'src/helper/listeners/accept-practitioner';
import { DeclinePractitionerListener } from 'src/helper/listeners/decline-practitioner';
import { AcceptPractitionerListener11 } from 'src/helper/listeners/accept-11-practitioner';
import { AcceptPractitionerListener12 } from 'src/helper/listeners/accept-12-practitioner';
import { SendHealthInfo } from 'src/helper/listeners/send-health-info';
import { SendHealthInfoService } from './service/send-health-info';
import { PractitionerKit } from 'src/kit/entity/practitioner-kits.entity';
import { Order } from 'src/order/entity/order.entity';
import { PractitionerReplacementKitController } from './practitioner-replacement-kit.controller';
import { KitReplacementRequest } from 'src/replacement-kit/entity/kit-replacement-request.entity';
import { ReplacementKitCheckoutService } from 'src/replacement-kit/services/replacement-kit-checkout.service';
import { ReplacementKitRequestService } from 'src/replacement-kit/services/replacement-kit-request.service';
import { CreateCheckoutSessionService } from 'src/payment/services/create-checkout-session.service';
import { PaymentModule } from 'src/payment/payment.module';
import { QueueCoreModule } from 'src/queues/queue-core.module';

@Module({
  imports: [
    QueueCoreModule,
    TypeOrmModule.forFeature([
      Practitioner,
      User,
      ExternalPractitioner,
      ClientPractitioner,
      PractitionerKit,
      Order,
      KitReplacementRequest,
    ]),
    forwardRef(() => PaymentModule),
  ],
  controllers: [PractitionerController, PractitionerReplacementKitController],
  providers: [
    CreatePractitionerAccountService,
    VerifyAccountListener,
    GetAllPractitionerProfileService,
    UpdatePractitionerAccountService,
    CreateClientService,
    NewPractitionerListener,
    UpdatePractitionerStatusService,
    CreateBulkPractitionerAccountService,
    CompleteRegistrationListener,
    UpdatePractitionerAccountIdService,
    SentryInterceptor,
    AcceptPractitionerListener,
    DeclinePractitionerListener,
    AcceptPractitionerListener11,
    AcceptPractitionerListener12,
    SendHealthInfo,
    SendHealthInfoService,
    ReplacementKitCheckoutService,
    ReplacementKitRequestService,
    CreateCheckoutSessionService,
  ],
})
export class PractitionerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyTokenMiddleware)
      .exclude(
        { path: 'practitioners', method: RequestMethod.POST },
        { path: 'practitioners/bulk', method: RequestMethod.POST },
        { path: 'practitioners/resend-invites', method: RequestMethod.POST },
        { path: 'practitioners', method: RequestMethod.GET },
        { path: 'practitioners/login', method: RequestMethod.POST },
        { path: 'practitioners/send-info', method: RequestMethod.POST },
      )
      .forRoutes('practitioners*');
  }
}
