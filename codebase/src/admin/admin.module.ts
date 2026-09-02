import {
  MiddlewareConsumer,
  Module,
  NestModule,
  forwardRef,
} from '@nestjs/common';
import { VerifyTokenMiddleware } from 'src/common/middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { AdminController } from './admin.controller';
import { CreateAdminAccountService } from './service/create-admin';
import { GetAdminsService } from './service/get-admins';
import { UpdateAccountService } from './service/update-account';
import { SentryInterceptor } from 'src/sentry/sentry.interceptor';
import { Admin } from './entity/admin.entity';
import { UpdateAdminAccountService } from './service/update-admin-account';
import { AdminReplacementKitController } from './admin-replacement-kit.controller';
import { ReplacementKitRequestService } from 'src/replacement-kit/services/replacement-kit-request.service';
import { ReplacementKitCheckoutService } from 'src/replacement-kit/services/replacement-kit-checkout.service';
import { KitReplacementRequest } from 'src/replacement-kit/entity/kit-replacement-request.entity';
import { Order } from 'src/order/entity/order.entity';
import { Practitioner } from 'src/practitioner/entity/practitioner.entity';
import { CreateCheckoutSessionService } from 'src/payment/services/create-checkout-session.service';
import { PaymentModule } from 'src/payment/payment.module';
import { StripePrice } from 'src/payment/entity/stripe-price.entity';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PromoteUserToAdminService } from './service/promote-user-to-admin';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Admin,
      StripePrice,
      KitReplacementRequest,
      Order,
      Practitioner,
    ]),
    forwardRef(() => PaymentModule),
  ],
  controllers: [AdminController, AdminReplacementKitController],
  providers: [
    CreateAdminAccountService,
    GetAdminsService,
    UpdateAccountService,
    UpdateAdminAccountService,
    PromoteUserToAdminService,
    SentryInterceptor,
    ReplacementKitRequestService,
    ReplacementKitCheckoutService,
    CreateCheckoutSessionService,
    RolesGuard,
  ],
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(VerifyTokenMiddleware).forRoutes('admin*');
  }
}
