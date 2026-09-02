import { ReturnLabelClarificationListener } from './../helper/listeners/return-label-clarification';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { VerifyTokenMiddleware } from 'src/common/middleware';
import { OrdersController } from './order.controller';
import { CreateOrderService } from './service/create-order';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entity/order.entity';
import { GetSingleOrderService } from './service/get-single-order';
import { DeleteOrdersService } from './service/delete-order';
import { GetAllOrderService } from './service/get-orders';
import { SentryInterceptor } from 'src/sentry/sentry.interceptor';
import { User } from 'src/user/entity/user.entity';
import { PaymentModule } from 'src/payment/payment.module';
import { GetPaidOrderService } from './service/get-paid-orders';
import { UpdateOrderService } from './service/update-order';
import { GetPractitionerOrderService } from './service/get-practitioner-orders';
import { Shipping } from './entity/shipping.entity';
import { GetWebsiteOrdersService } from './service/get-website-orders';
import { UpdateWebsiteOrderService } from './service/update-website-order';
import { PayOrderService } from './service/pay-order';
import { OrderKit } from './entity/order-kit.entity';
import { SaveOrderService } from './service/save-order';
import { GetOrderKitService } from './service/get-orders-kit';
import { ShotgunWaitlistService } from './service/shotgun-waitlist';
import { ShotgunWaitlist } from './entity/shotgun-waitlist.entity';
import { ReminderService } from './service/waitlist-reminder';
import { Reminder } from 'src/reminders/entity/reminder.entity';
import { WaitListFirstReminderListener } from 'src/helper/listeners/waitlist-first-reminder';
import { WaitListSecondReminderListener } from 'src/helper/listeners/waitlist-second-reminder ';
import { WaitListSecondPaymentListener } from 'src/helper/listeners/waitlist-second-payment ';
import { WaitListFirstPaymentListener } from 'src/helper/listeners/waitlist-first-payment';
import { GetWaitlistOrderService } from './service/get-waitlist-orders';
import { GetPractitionerWaitlistOrderService } from './service/get-practitioner-waitlist-orders';
import { WaitListThirdReminderListener } from 'src/helper/listeners/waitlist-third-reminder';
import { ExtraShippingPackage } from './entity/shipping-package.entity';
import { CreateKitOnsiteOrderService } from './service/create-kit-onsite-order.service';
import { CreateBulkOrderService } from './service/create-bulk-order.service';
import { CreatePaygOrderService } from './service/create-payg-order.service';
import { ConsentAcceptanceService } from './service/consent-acceptance.service';
import { PaymentMethod } from 'src/payment/entity/payment-method.entity';
import { PaymentStatement } from 'src/payment/entity/payment-statement.entity';
import { PaymentStatementItem } from 'src/payment/entity/payment-statement-item.entity';
import { Transaction } from 'src/payment/entity/transaction.entity';
import { CheckPaymentMethodAvailabilityService } from './service/check-payment-method-availability';
import { MonthlyBillingAccessGuard } from './guards/monthly-billing-access.guard';
import { CancelOrderService } from './service/cancel-order.service';
import { TrackingEmailListener } from 'src/helper/listeners/tracking-email';
import { SampleCollectionGuidelineListener } from 'src/helper/listeners/sample-collection-guideline';
import { MailModule } from 'src/mail/mail.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      User,
      Shipping,
      OrderKit,
      ShotgunWaitlist,
      Reminder,
      ExtraShippingPackage,
      PaymentMethod,
      PaymentStatement,
      PaymentStatementItem,
      Transaction,
    ]),

    forwardRef(() => PaymentModule),
    MailModule,
    BullModule.registerQueue({
      name: 'mail',
    }),
  ],
  controllers: [OrdersController],
  providers: [
    CreateOrderService,
    GetSingleOrderService,
    DeleteOrdersService,
    GetAllOrderService,
    SentryInterceptor,
    GetPaidOrderService,
    UpdateOrderService,
    GetPractitionerOrderService,
    GetWebsiteOrdersService,
    UpdateWebsiteOrderService,
    PayOrderService,
    GetOrderKitService,
    SaveOrderService,
    TrackingEmailListener,
    SampleCollectionGuidelineListener,
    ShotgunWaitlistService,
    ReminderService,
    WaitListFirstReminderListener,
    WaitListSecondReminderListener,
    WaitListSecondPaymentListener,
    WaitListFirstPaymentListener,
    GetWaitlistOrderService,
    GetPractitionerWaitlistOrderService,
    WaitListThirdReminderListener,
    CreateKitOnsiteOrderService,
    CreateBulkOrderService,
    CreatePaygOrderService,
    ConsentAcceptanceService,
    CheckPaymentMethodAvailabilityService,
    MonthlyBillingAccessGuard,
    CancelOrderService,
    ReturnLabelClarificationListener,
  ],
})
export class OrderModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyTokenMiddleware)
      .exclude(
        {
          path: 'orders/waitlist',
          method: RequestMethod.POST,
        },
        { path: 'orders/send-reminders', method: RequestMethod.GET },
        {
          path: 'orders/complete-waitlist-payment',
          method: RequestMethod.POST,
        },
        {
          path: 'orders/consent-acceptance',
          method: RequestMethod.POST,
        },
        {
          path: 'orders/consent-decision/:sessionI',
          method: RequestMethod.GET,
        },
      )
      .forRoutes('orders*');
  }
}
