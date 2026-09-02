import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { VerifyTokenMiddleware } from 'src/common/middleware';
import { UserController } from './user.controller';
import { CreateCustomerAccountService } from './service/create-customer-account';
import { LoginAccountService } from './service/login-account';
import { GetUserProfileService } from './service/get-user-profile';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { User } from './entity/user.entity';
import { VerifyAccountListener } from 'src/helper/listeners/verify-account';
import { ResendValidationTokenService } from './service/resend-validation-token';
import { ValidateAccountService } from './service/validate-account';
import { GetAllUserService } from './service/get-users';
import { GetAUserProfileService } from './service/get-a-user-profile';
import { UpdateAccountService } from './service/update-account';
import { CompleteCustomerRegistration } from './service/complete-customer-registration';
import { ForgotPasswordService } from './service/forgot-password';
import { ResetPasswordService } from './service/reset-password';
import { ResetPasswordListener } from 'src/helper/listeners/reset-password';
import { ChangeUserPasswordService } from './service/change-password';
import { UpdatePasswordService } from './service/updatePassword';
import { Practitioner } from 'src/practitioner/entity/practitioner.entity';
import { NewPractitionerListener } from 'src/helper/listeners/newPractitioner';
import { CreatePasswordService } from './service/create-password';
import { ExternalPractitioner } from 'src/practitioner/entity/external-practitioner.entity';
import { SentryInterceptor } from '../sentry/sentry.interceptor';
import { ResendNewPlatformPasswordResetService } from './service/resend-new-platform-password-reset';
import { ResetNewPlatformPasswordService } from './service/reset-new-platform-password';
import { NewPlatformPasswordResetListener } from 'src/helper/listeners/new-platform-password-reset';
import { Admin } from 'src/admin/entity/admin.entity';
import { Transfer } from './entity/transfer-log.entity';
import { InitiateTransferService } from './service/initiate-transfer';
import { VerifyTransferService } from './service/verify-transfer';
import { CompleteTransferService } from './service/complete-transfer';
import { InitiateTransferListener } from 'src/helper/listeners/initiate-transfer';
import { VerifyTransferListener } from 'src/helper/listeners/verify-transfer';
import { PaymentStatement } from 'src/payment/entity/payment-statement.entity';
import { PaymentStatementItem } from 'src/payment/entity/payment-statement-item.entity';
import { MonthlyBillingAccessService } from './service/monthly-billing-access.service';
import { PaymentMethod } from 'src/payment/entity/payment-method.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ExternalPractitioner,
      Practitioner,
      Admin,
      Transfer,
      PaymentStatement,
      PaymentStatementItem,
      PaymentMethod,
    ]),
    
  ],
  controllers: [UserController],
  providers: [
    CreateCustomerAccountService,
    LoginAccountService,
    GetUserProfileService,
    VerifyAccountListener,
    ResendValidationTokenService,
    ValidateAccountService,
    GetAllUserService,
    GetAUserProfileService,
    UpdateAccountService,
    CompleteCustomerRegistration,
    ForgotPasswordService,
    ResetPasswordService,
    ResetPasswordListener,
    ChangeUserPasswordService,
    UpdatePasswordService,
    CreatePasswordService,
    NewPractitionerListener,
    ResendNewPlatformPasswordResetService,
    ResetNewPlatformPasswordService,
    NewPlatformPasswordResetListener,
    SentryInterceptor,
    InitiateTransferService,
    VerifyTransferService,
    CompleteTransferService,
    InitiateTransferListener,
    VerifyTransferListener,
    MonthlyBillingAccessService,
  ],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyTokenMiddleware)
      .exclude(
        { path: 'users', method: RequestMethod.POST },
        { path: 'users/validate-account', method: RequestMethod.POST },
        { path: 'users/resend-token', method: RequestMethod.POST },
        { path: 'users', method: RequestMethod.GET },
        { path: 'users/{id}', method: RequestMethod.GET },
        { path: 'users/login', method: RequestMethod.POST },
        { path: 'users/complete-registration', method: RequestMethod.POST },
        { path: 'users/forgot-password', method: RequestMethod.POST },
        { path: 'users/reset-password/:token', method: RequestMethod.POST },
        {
          path: 'users/resend-new-platform-password',
          method: RequestMethod.POST,
        },
        {
          path: 'users/reset-new-platform-password/:token',
          method: RequestMethod.POST,
        },
        { path: 'users/create-password/:token', method: RequestMethod.POST },
        { path: 'users/verify-transfer', method: RequestMethod.POST },
        { path: 'users/complete-transfer', method: RequestMethod.POST },
      )
      .forRoutes('users*');
  }
}
