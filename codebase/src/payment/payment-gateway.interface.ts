import { PaymentStatement } from './entity/payment-statement.entity';
import { User } from 'src/user/entity/user.entity';
import Stripe from 'stripe';
import { CheckoutMode, Currency } from 'src/enum';

export interface PaymentGateway {
  createCheckoutSession(params: {
    priceId: string;
    mode: CheckoutMode;
    quantity: number;
    successUrl: string;
    cancelUrl: string;
    referenceId: string;
    metadata: Record<string, string>;
    customerId?: string;
    allowedCountries?: string[];
  }): Promise<{ id: string; url: string; customerId?: string; raw: any }>;
  getOrCreateCustomer(
    email: string,
    name?: string,
  ): Promise<{
    id: string;
    email?: string;
    name?: string;
  }>;
  paymentWebhook(data: any, signature): Promise<any>;
  updateShipping(): Promise<void>;
  getPaymentMethod(userId: string): Promise<any>;
  chargePaymentMethod(
    firstName: string,
    lastName: string,
    userId: string,
    kitType: string,
    paymentMethodId: string,
    country: string,
    quantity: number,
    referenceId?: string,
    isPreOrder?: boolean,
  ): Promise<any>;
  processFirstWaitlistPayment(
    referenceId: string,
    currency: Currency,
    firstName: string,
    lastName: string,
    email: string,
    quantity?: number,
  );
  processSecondWaitlistPayment(
    referenceId: string,
    initialReferenceId: string,
    quantity: number,
  );
  getAllCheckoutSessions(): Promise<any>;
  createInvoiceItem(
    userId: string,
    orderReferenceId: string,
    unit_amount: number,
    currency: string,
    kitType: string,
    quantity: number,
    country: string,
    description: string,
  ): Promise<Stripe.InvoiceItem>;
  createInvoice(
    primaryStatement: PaymentStatement,
    additionalStatements?: PaymentStatement[],
  ): Promise<Stripe.Response<Stripe.Invoice>>;
  finalizeInvoice(
    invoiceId: string,
    opts?: { idempotencyKey?: string },
  ): Promise<Stripe.Response<Stripe.Invoice>>;
  sendInvoice(
    invoiceId: string,
    opts?: { idempotencyKey?: string },
  ): Promise<Stripe.Response<Stripe.Invoice>>;
  updateInvoice(
    invoiceId: string,
    params: Stripe.InvoiceUpdateParams,
    opts?: { idempotencyKey?: string },
  ): Promise<Stripe.Response<Stripe.Invoice>>;
  retrieveInvoice(
    invoiceId: string,
    options?: Stripe.InvoiceRetrieveParams,
  ): Promise<Stripe.Response<Stripe.Invoice>>;
  retrievePrice(priceId: string): Promise<Stripe.Response<Stripe.Price>>;
  payInvoice(
    invoiceId: string,
    params?: Stripe.InvoicePayParams,
    opts?: { idempotencyKey?: string },
  ): Promise<Stripe.Response<Stripe.Invoice>>;
  savePaymentMethod(sessionId: string): Promise<{ message: string }>;
  retrieveCheckoutSession(
    sessionId: string,
    options?: { expand?: string[] },
  ): Promise<any>;
  retrievePaymentMethod(paymentMethodId: string): Promise<any>;
  attachPaymentMethod(
    paymentMethodId: string,
    customerId: string,
  ): Promise<any>;
  deletePaymentMethod(paymentMethodId: string): Promise<any>;
  updateDefaultPaymentMethod(user: User, paymentMethodId: string): Promise<any>;
  createSetupIntent(customerId: string): Promise<{
    setupIntentId: string;
    clientSecret: string;
  }>;
  confirmPaymentMethod(setupIntentId: string): Promise<{
    setupIntent: Stripe.SetupIntent;
    paymentMethod: Stripe.PaymentMethod;
  }>;
}
