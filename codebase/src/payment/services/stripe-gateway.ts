import Stripe from 'stripe';
import { PaymentGateway } from '../payment-gateway.interface';
import { Injectable } from '@nestjs/common';
import { StripePaymentWebhook } from './stripe/payment-webhook';
import { CheckoutMode, Currency, KitType } from 'src/enum';

import { StripeUpdateShippingService } from './stripe/update-shipping';
import { StripeGetPaymentMethod } from './stripe/get-payment-method';
import { StripeChargePaymentMethod } from './stripe/charge-payment-method';
import { StripeProcessFirstWaitlistPayment } from './stripe/process-first-waitlist-payment';
import { StripeProcessSecondWaitlistPayment } from './stripe/process-second-waitlist-payment';
import { StripeGetCheckoutSessions } from './stripe/get-checkout-sessions';
import { StripeCreateInvoiceItem } from './stripe/create-invoice-item';
import { StripeCreateInvoice } from './stripe/create-invoice';
import { PaymentStatement } from '../entity/payment-statement.entity';
import { StripeFinalizeInvoice } from './stripe/finalize-invoice';
import { StripeSendInvoice } from './stripe/send-invoice';
import { StripeUpdateInvoice } from './stripe/update-invoice';
import { StripeRetrievePrice } from './stripe/retrieve-price';
import { StripeRetrieveInvoice } from './stripe/retrieve-invoice';
import { StripePayInvoice } from './stripe/pay-invoice';
import { StripeSavePaymentMethodService } from './stripe/save-payment-method.service';
import { StripeRetrieveCheckoutSessionService } from './stripe/retrieve-checkout-session.service';
import { StripeRetrievePaymentMethodService } from './stripe/retrieve-payment-method.service';
import { StripeAttachPaymentMethodService } from './stripe/attach-payment-method.service';
import { StripeDeletePaymentMethodService } from './stripe/delete-payment-method.service';
import { StripeUpdateDefaultPaymentMethodService } from './stripe/update-default-payment-method.service';
import { User } from 'src/user/entity/user.entity';
import { StripeCreateSetupIntentService } from './stripe/create-setup-intent.service';
import { StripeConfirmPaymentMethodService } from './stripe/confirm-payment-method.service';
import { StripeCreateCheckoutSessionService } from './stripe/create-checkout-session.service';
import { StripeGetOrCreateCustomerByEmail } from './stripe/get-or-create-customer-by-email';

@Injectable()
export class StripeGateway implements PaymentGateway {
  constructor(
    private readonly stripePaymentWebhook: StripePaymentWebhook,
    private readonly stripeUpdateShippingService: StripeUpdateShippingService,
    private readonly stripeGetPaymentMethod: StripeGetPaymentMethod,
    private readonly stripeChargePaymentMethod: StripeChargePaymentMethod,
    private readonly stripeProcessFirstWaitlistPayment: StripeProcessFirstWaitlistPayment,
    private readonly stripeProcessSecondWaitlistPayment: StripeProcessSecondWaitlistPayment,
    private readonly stripeGetCheckoutSessions: StripeGetCheckoutSessions,
    private readonly stripeCreateInvoiceItem: StripeCreateInvoiceItem,
    private readonly stripeCreateInvoice: StripeCreateInvoice,
    private readonly stripeFinalizeInvoice: StripeFinalizeInvoice,
    private readonly stripeSendInvoice: StripeSendInvoice,
    private readonly stripeUpdateInvoice: StripeUpdateInvoice,
    private readonly stripeRetrieveInvoice: StripeRetrieveInvoice,
    private readonly stripeRetrievePrice: StripeRetrievePrice,
    private readonly stripePayInvoice: StripePayInvoice,
    private readonly stripeSavePaymentMethodService: StripeSavePaymentMethodService,
    private readonly stripeRetrieveCheckoutSessionService: StripeRetrieveCheckoutSessionService,
    private readonly stripeRetrievePaymentMethodService: StripeRetrievePaymentMethodService,
    private readonly stripeAttachPaymentMethodService: StripeAttachPaymentMethodService,
    private readonly stripeDeletePaymentMethodService: StripeDeletePaymentMethodService,
    private readonly stripeUpdateDefaultPaymentMethodService: StripeUpdateDefaultPaymentMethodService,
    private readonly stripeCreateSetupIntentService: StripeCreateSetupIntentService,
    private readonly stripeConfirmPaymentMethodService: StripeConfirmPaymentMethodService,
    private readonly stripeCreateCheckoutSessionService: StripeCreateCheckoutSessionService,
    private readonly stripeGetOrCreateCustomerByEmail: StripeGetOrCreateCustomerByEmail,
  ) {}

  async createCheckoutSession(params: {
    priceId: string;
    mode: CheckoutMode;
    quantity: number;
    successUrl: string;
    cancelUrl: string;
    referenceId: string;
    metadata: Record<string, string>;
    customerId?: string;
    allowedCountries?: string[];
  }): Promise<{ id: string; url: string; customerId?: string; raw: any }> {
    const session = await this.stripeCreateCheckoutSessionService.execute({
      priceId: params.priceId,
      mode: params.mode,
      quantity: params.quantity,
      successUrl: params.successUrl,
      cancelUrl: params.cancelUrl,
      referenceId: params.referenceId,
      metadata: params.metadata,
      customerId: params.customerId,
      allowedCountries: params.allowedCountries,
    });

    return {
      id: session.id,
      url: session.url || '',
      customerId: params.customerId,
      raw: session.raw,
    };
  }

  async getOrCreateCustomer(
    email: string,
    name?: string,
  ): Promise<{
    id: string;
    email?: string;
    name?: string;
  }> {
    const customer = await this.stripeGetOrCreateCustomerByEmail.execute(
      email,
      name,
    );
    return {
      id: customer.id,
      email: customer.email || undefined,
      name: customer.name || undefined,
    };
  }

  async paymentWebhook(data: any, signature: string) {
    try {
      const result = await this.stripePaymentWebhook.execute(data, signature);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateShipping(): Promise<void> {
    try {
      await this.stripeUpdateShippingService.execute();
    } catch (error) {
      throw error;
    }
  }

  async getPaymentMethod(userId: string): Promise<any> {
    try {
      const result = await this.stripeGetPaymentMethod.execute(userId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async chargePaymentMethod(
    firstName: string,
    lastName: string,
    userId: string,
    kitType: KitType,
    paymentMethodId: string,
    country: string,
    quantity: number,
    referenceId?: string,
    isPreOrder?: boolean,
  ): Promise<any> {
    try {
      return await this.stripeChargePaymentMethod.execute(
        firstName,
        lastName,
        userId,
        kitType,
        paymentMethodId,
        country,
        quantity,
        referenceId,
        isPreOrder,
      );
    } catch (error) {
      throw error;
    }
  }

  async processFirstWaitlistPayment(
    referenceId: string,
    currency: Currency,
    firstName: string,
    lastName: string,
    email: string,
    quantity?: number,
  ): Promise<Stripe.Checkout.Session> {
    try {
      const result = await this.stripeProcessFirstWaitlistPayment.execute(
        referenceId,
        currency,
        firstName,
        lastName,
        email,
        undefined,
        quantity,
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  async processSecondWaitlistPayment(
    referenceId: string,
    initialReferenceId: string,
    quantity: number,
  ): Promise<Stripe.Checkout.Session> {
    try {
      const result = await this.stripeProcessSecondWaitlistPayment.execute(
        referenceId,
        initialReferenceId,
        quantity,
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getAllCheckoutSessions(): Promise<any> {
    return this.stripeGetCheckoutSessions.execute();
  }

  async createInvoiceItem(
    userId: string,
    orderReferenceId: string,
    unit_amount: number,
    currency: string,
    kitType: string,
    quantity: number,
    country: string,
    description: string,
  ): Promise<Stripe.InvoiceItem> {
    try {
      return await this.stripeCreateInvoiceItem.execute(
        userId,
        orderReferenceId,
        unit_amount,
        currency,
        kitType,
        quantity,
        country,
        description,
      );
    } catch (error) {
      throw error;
    }
  }

  async createInvoice(
    primaryStatement: PaymentStatement,
    additionalStatements?: PaymentStatement[],
  ): Promise<Stripe.Response<Stripe.Invoice>> {
    try {
      return await this.stripeCreateInvoice.execute(
        primaryStatement,
        additionalStatements,
      );
    } catch (error) {
      throw error;
    }
  }

  async finalizeInvoice(
    invoiceId: string,
    opts?: { idempotencyKey?: string },
  ): Promise<Stripe.Response<Stripe.Invoice>> {
    return this.stripeFinalizeInvoice.execute(invoiceId, opts);
  }

  async sendInvoice(
    invoiceId: string,
    opts?: { idempotencyKey?: string },
  ): Promise<Stripe.Response<Stripe.Invoice>> {
    return this.stripeSendInvoice.execute(invoiceId, opts);
  }

  async updateInvoice(
    invoiceId: string,
    params: Stripe.InvoiceUpdateParams,
    opts?: { idempotencyKey?: string },
  ): Promise<Stripe.Response<Stripe.Invoice>> {
    return this.stripeUpdateInvoice.execute(invoiceId, params, opts);
  }

  async retrieveInvoice(
    invoiceId: string,
    options?: Stripe.InvoiceRetrieveParams,
  ): Promise<Stripe.Response<Stripe.Invoice>> {
    return this.stripeRetrieveInvoice.execute(invoiceId, options);
  }

  async retrievePrice(priceId: string): Promise<Stripe.Response<Stripe.Price>> {
    return this.stripeRetrievePrice.execute(priceId);
  }

  async payInvoice(
    invoiceId: string,
    params?: Stripe.InvoicePayParams,
    opts?: { idempotencyKey?: string },
  ): Promise<Stripe.Response<Stripe.Invoice>> {
    return this.stripePayInvoice.execute(invoiceId, params, opts);
  }

  async savePaymentMethod(sessionId: string): Promise<{ message: string }> {
    return this.stripeSavePaymentMethodService.execute(sessionId);
  }

  async retrieveCheckoutSession(
    sessionId: string,
    options?: { expand?: string[] },
  ): Promise<any> {
    return this.stripeRetrieveCheckoutSessionService.execute(
      sessionId,
      options,
    );
  }

  async retrievePaymentMethod(paymentMethodId: string): Promise<any> {
    return this.stripeRetrievePaymentMethodService.execute(paymentMethodId);
  }

  async attachPaymentMethod(
    paymentMethodId: string,
    customerId: string,
  ): Promise<any> {
    return this.stripeAttachPaymentMethodService.execute(
      paymentMethodId,
      customerId,
    );
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<any> {
    return this.stripeDeletePaymentMethodService.execute(paymentMethodId);
  }

  async updateDefaultPaymentMethod(
    user: User,
    paymentMethodId: string,
  ): Promise<any> {
    return this.stripeUpdateDefaultPaymentMethodService.execute(
      user.stripeId,
      paymentMethodId,
    );
  }

  async createSetupIntent(customerId: string): Promise<{
    setupIntentId: string;
    clientSecret: string;
  }> {
    return this.stripeCreateSetupIntentService.execute(customerId);
  }

  async confirmPaymentMethod(setupIntentId: string): Promise<{
    setupIntent: Stripe.SetupIntent;
    paymentMethod: Stripe.PaymentMethod;
  }> {
    return this.stripeConfirmPaymentMethodService.execute(setupIntentId);
  }
}
