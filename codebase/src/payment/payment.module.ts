import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeGateway } from './services/stripe-gateway';
import { PaymentController } from './controllers/payment.controller';
import { PaymentWebhookService } from './services/payment-webhook';
import { KitPurchaseListener } from 'src/helper/listeners/kit-purchase';
import { Shipping } from '../order/entity/shipping.entity';
import { CancelledTransactionListener } from 'src/helper/listeners/cancelled-transactions';
import { UpdateShippingService } from './services/update-shipping';
import { ShippingUpdateListener } from 'src/helper/listeners/shipping-update';
import { PractitionerKitPurchaseListener } from 'src/helper/listeners/practitioner-kit-purchase';
import { PaymentMethod } from './entity/payment-method.entity';
import { GetPaymnetMethodService } from './services/get-payment-methods';
import { chargePaymentMethodService } from './services/charge-payment-method';
import { VerifyTokenMiddleware } from 'src/common/middleware';
import { ProcessFirstWaitlistPaymentService } from './services/process-first-waitlist-payment';
import { ProcessSecondWaitlistPaymentService } from './services/process-second-waitlist-payment';
import { InvoicePaymentFailedService as StripeInvoicePaymentFailed } from './services/stripe/invoice-payment-failed.service';
import { InvoicePaymentSucceededService as StripeInvoicePaymentSucceededService } from './services/stripe/invoice-payment-succeeded.service';
import { PaymentStatement } from './entity/payment-statement.entity';
import { PaymentStatementItem } from './entity/payment-statement-item.entity';
import { Order } from 'src/order/entity/order.entity';
import { Transaction } from './entity/transaction.entity';
import { GetCheckoutSessions } from './services/get-checkout-sessions';
import { CreateInvoiceItemService } from './services/create-invoice-item';
import { CreateInvoiceService } from './services/create-invoice';
import { StripePaymentWebhook } from './services/stripe/payment-webhook';
import { StripeUpdateShippingService } from './services/stripe/update-shipping';
import { StripeGetPaymentMethod } from './services/stripe/get-payment-method';
import { StripeChargePaymentMethod } from './services/stripe/charge-payment-method';
import { StripeProcessFirstWaitlistPayment } from './services/stripe/process-first-waitlist-payment';
import { StripeProcessSecondWaitlistPayment } from './services/stripe/process-second-waitlist-payment';
import { StripeGetCheckoutSessions } from './services/stripe/get-checkout-sessions';
import { StripeCancelledTransactionService } from './services/stripe/cancelled-transactions';
import { StripeCreateInvoiceItem } from './services/stripe/create-invoice-item';
import { StripeCreateInvoice } from './services/stripe/create-invoice';
import { InvoiceCreatedListener } from 'src/helper/listeners/invoice-created';
import { PaymentReceiptListener } from 'src/helper/listeners/payment-receipt';
import { StripeFinalizeInvoice } from './services/stripe/finalize-invoice';
import { StripeSendInvoice } from './services/stripe/send-invoice';
import { StripeUpdateInvoice } from './services/stripe/update-invoice';
import { UpdateInvoiceService } from './services/update-invoice';
import { FinalizeInvoiceService } from './services/finalize-invoice';
import { SendInvoiceService } from './services/send-invoice';
import { StripeInvoiceFinalizationFailedService } from './services/stripe/invoice-finalization-failed.service';
import { StripeRetrieveInvoice } from './services/stripe/retrieve-invoice';
import { StripePromotionCodeService } from './services/stripe/promotion-code.service';
import { StripePaymentReceiptService } from './services/stripe/payment-receipt';
import { RetrieveInvoiceService } from './services/retrieve-invoice';
import { StripeRetrievePrice } from './services/stripe/retrieve-price';
import { RetrievePriceService } from './services/retrieve-price';
import { StripeWaitlistWebhookService } from './services/stripe/waitlist-webhook.service';
import { StripeGetOrCreateCustomerByEmail } from './services/stripe/get-or-create-customer-by-email';
import { ProcessStripeOrderService } from './services/stripe/process-stripe-order.service';
import { StripeCheckoutSessionCompletedService } from './services/stripe/checkout-session-completed.service';
import { StripePayInvoice } from './services/stripe/pay-invoice';
import { PayInvoiceService } from './services/pay-invoice';
import { StripeSavePaymentMethodService } from './services/stripe/save-payment-method.service';
import { SavePaymentMethodService } from './services/save-payment-method.service';
import { RetrieveCheckoutSessionService } from './services/retrieve-checkout-session.service';
import { StripeRetrieveCheckoutSessionService } from './services/stripe/retrieve-checkout-session.service';
import { AttachPaymentMethodService } from './services/attach-payment-method.service';
import { StripeAttachPaymentMethodService } from './services/stripe/attach-payment-method.service';
import { RetrievePaymentMethodService } from './services/retrieve-payment-method.service';
import { StripeRetrievePaymentMethodService } from './services/stripe/retrieve-payment-method.service';
import { StripeInvoiceNotificationService } from './services/stripe/invoice-notification.service';
import { InvoicePaidListener } from 'src/helper/listeners/invoice-paid';
import { PdfGeneratorService } from 'src/services/pdf-generator.service';
import { S3BucketService } from 'src/aws/services/s3-bucket.service';
import { DeletePaymentMethodService } from './services/delete-payment-method.service';
import { StripeDeletePaymentMethodService } from './services/stripe/delete-payment-method.service';
import { UpdateDefaultPaymentMethodService } from './services/update-default-payment-method.service';
import { StripeUpdateDefaultPaymentMethodService } from './services/stripe/update-default-payment-method.service';
import { CreateSetupIntentService } from './services/create-setup-intent.service';
import { StripeCreateSetupIntentService } from './services/stripe/create-setup-intent.service';
import { ConfirmPaymentMethodService } from './services/confirm-payment-method.service';
import { StripeConfirmPaymentMethodService } from './services/stripe/confirm-payment-method.service';
import { User } from 'src/user/entity/user.entity';
import { StripePaymentUrlGeneratorService } from './services/stripe/payment-url-generator.service';
import { StripePrice } from './entity/stripe-price.entity';
import { StripePriceService } from './services/stripe-price.service';
import { CreateCheckoutSessionService } from './services/create-checkout-session.service';
import { StripeCreateCheckoutSessionService } from './services/stripe/create-checkout-session.service';
import { GuestCheckoutService } from './services/guest-checkout.service';
import { StripeSyncPricesService } from './services/stripe-sync-prices.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Shipping,
      PaymentMethod,
      PaymentStatement,
      PaymentStatementItem,
      Order,
      Transaction,
      User,
      StripePrice,
    ]),
    // QueueModule is @Global(), no need to import it
  ],
  controllers: [PaymentController],
  providers: [
    PaymentWebhookService,
    UpdateShippingService,
    GetPaymnetMethodService,
    chargePaymentMethodService,
    ProcessFirstWaitlistPaymentService,
    ProcessSecondWaitlistPaymentService,
    {
      provide: 'PaymentGateway',
      useClass: StripeGateway,
    },
    KitPurchaseListener,
    PractitionerKitPurchaseListener,
    CancelledTransactionListener,
    ShippingUpdateListener,
    GetCheckoutSessions,
    CreateInvoiceItemService,
    CreateInvoiceService,
    StripePaymentWebhook,
    StripeUpdateShippingService,
    StripeGetPaymentMethod,
    StripeChargePaymentMethod,
    StripeProcessFirstWaitlistPayment,
    StripeProcessSecondWaitlistPayment,
    StripeGetCheckoutSessions,
    StripeCancelledTransactionService,
    StripeCreateInvoiceItem,
    StripeCreateInvoice,
    StripePaymentReceiptService,
    StripePromotionCodeService,
    StripeInvoicePaymentFailed,
    StripeInvoicePaymentSucceededService,
    StripeInvoiceFinalizationFailedService,
    InvoiceCreatedListener,
    PaymentReceiptListener,
    StripeFinalizeInvoice,
    StripeSendInvoice,
    StripeUpdateInvoice,
    StripeRetrieveInvoice,
    StripeRetrievePrice,
    StripeGetOrCreateCustomerByEmail,
    StripeWaitlistWebhookService,
    ProcessStripeOrderService,
    StripeCheckoutSessionCompletedService,
    UpdateInvoiceService,
    FinalizeInvoiceService,
    SendInvoiceService,
    RetrieveInvoiceService,
    RetrievePriceService,
    StripePayInvoice,
    PayInvoiceService,
    SavePaymentMethodService,
    StripeSavePaymentMethodService,
    RetrieveCheckoutSessionService,
    StripeRetrieveCheckoutSessionService,
    AttachPaymentMethodService,
    StripeAttachPaymentMethodService,
    RetrievePaymentMethodService,
    StripeRetrievePaymentMethodService,
    StripeInvoiceNotificationService,
    InvoicePaidListener,
    PdfGeneratorService,
    S3BucketService,
    DeletePaymentMethodService,
    StripeDeletePaymentMethodService,
    UpdateDefaultPaymentMethodService,
    StripeUpdateDefaultPaymentMethodService,
    CreateSetupIntentService,
    StripeCreateSetupIntentService,
    ConfirmPaymentMethodService,
    StripeConfirmPaymentMethodService,
    StripePaymentUrlGeneratorService,
    StripePriceService,
    StripeSyncPricesService,
    CreateCheckoutSessionService,
    StripeCreateCheckoutSessionService,
    GuestCheckoutService,
  ],
  exports: [
    {
      provide: 'PaymentGateway',
      useClass: StripeGateway,
    },
    UpdateShippingService,
    chargePaymentMethodService,
    ProcessFirstWaitlistPaymentService,
    ProcessSecondWaitlistPaymentService,
    GetCheckoutSessions,
    CreateInvoiceService,
    UpdateInvoiceService,
    FinalizeInvoiceService,
    SendInvoiceService,
    RetrievePriceService,
    RetrieveInvoiceService,
    PayInvoiceService,
    SavePaymentMethodService,
    AttachPaymentMethodService,
    RetrievePaymentMethodService,
    RetrieveCheckoutSessionService,
    StripeInvoicePaymentSucceededService,
    InvoicePaidListener,
    StripePriceService,
    StripeSyncPricesService,
    PdfGeneratorService,
    S3BucketService,
    CreateInvoiceItemService,
    StripePaymentUrlGeneratorService,
    CreateCheckoutSessionService,
  ],
})
export class PaymentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyTokenMiddleware)
      .forRoutes(
        'payment/payment-methods',
        'payment/charge-payment-method',
        'payment/payment-methods/:id',
        'payment/payment-methods/:id/set-default',
        'payment/setup-intent',
        'payment/payment-methods/confirm',
      );
  }
}
