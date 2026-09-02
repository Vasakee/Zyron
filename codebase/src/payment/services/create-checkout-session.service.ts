import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BadRequestErrorException,
  NotFoundErrorException,
} from 'src/common/filters';
import { User } from 'src/user/entity/user.entity';
import { StripePriceService } from './stripe-price.service';
import { PaymentGateway } from '../payment-gateway.interface';
import {
  AllowedCountriesAbbrev,
  CheckoutMode,
  Currency,
  KitType,
  OrderPaymentType,
} from 'src/enum';

export type CreateCheckoutSessionParams = {
  kitType: KitType;
  currency: Currency;
  paymentType: OrderPaymentType;
  referenceId: string;
  quantity?: number;
  isPreOrder?: boolean;
  isAuthenticated: boolean;
  userId?: string;
  customerEmail?: string;
  customerName?: string;
  successUrl: string;
  cancelUrl: string;
};

type NormalizedParams = {
  kitType: KitType;
  currency: Currency;
  paymentType: OrderPaymentType;
  referenceId: string;
  quantity: number;
  isPreOrder: boolean;
  isAuthenticated: boolean;
  userId?: string;
  successUrl: string;
  cancelUrl: string;
};

const ALLOWED_KIT_TYPES = Object.values(KitType);
const ALLOWED_PAYMENT_TYPES: OrderPaymentType[] = [
  OrderPaymentType.PLATFORM_ORDER,
  OrderPaymentType.WEBSITE_ORDER,
  OrderPaymentType.KIT_REPLACEMENT_ORDER,
];
const ALLOWED_CURRENCIES = Object.values(Currency);
const ALLOWED_COUNTRIES = Object.values(AllowedCountriesAbbrev);

@Injectable()
export class CreateCheckoutSessionService {
  constructor(
    private readonly stripePriceService: StripePriceService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @Inject(forwardRef(() => 'PaymentGateway'))
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(
    params: CreateCheckoutSessionParams,
  ): Promise<{ id: string; url: string }> {
    const normalized = this.validate(params);

    const currencyForLookup = normalized.currency.toUpperCase();
    const { price, stripePriceId } =
      await this.stripePriceService.findActivePriceOrThrow(
        {
          kitType: normalized.kitType,
          paymentType: normalized.paymentType,
          currency: currencyForLookup,
        },
        { isPreOrder: normalized.isPreOrder },
      );

    let customerId: string | undefined;
    let customerEmail: string | undefined;
    let customerName: string | undefined;

    if (normalized.isAuthenticated) {
      const user = await this.userRepo.findOne({
        where: { id: normalized.userId },
      });
      if (!user) {
        throw new NotFoundErrorException('User not found');
      }

      customerEmail = user.email;
      customerName = [user.firstName, user.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();

      if (!customerEmail) {
        throw new BadRequestErrorException(
          'User email is required to create a checkout session',
        );
      }

      customerId = user.stripeId;
      if (!customerId) {
        // Avoid holding a DB lock during Stripe customer creation.
        const customer = await this.paymentGateway.getOrCreateCustomer(
          customerEmail,
          customerName,
        );
        customerId = customer.id;

        await this.userRepo.manager.transaction(async (manager) => {
          const repo = manager.getRepository(User);
          const lockedUser = await repo.findOne({
            where: { id: user.id },
            lock: { mode: 'pessimistic_write' },
          });

          if (lockedUser && !lockedUser.stripeId) {
            lockedUser.stripeId = customerId;
            await repo.save(lockedUser);
          }
        });
      }
    }

    if (
      price.mode !== CheckoutMode.Payment &&
      price.mode !== CheckoutMode.Subscription
    ) {
      throw new BadRequestErrorException('Invalid Stripe price mode');
    }

    const checkoutMode =
      price.mode === CheckoutMode.Subscription
        ? CheckoutMode.Subscription
        : CheckoutMode.Payment;

    const session = await this.paymentGateway.createCheckoutSession({
      priceId: stripePriceId,
      mode: checkoutMode,
      quantity: normalized.quantity,
      successUrl: normalized.successUrl,
      cancelUrl: normalized.cancelUrl,
      referenceId: normalized.referenceId,
      customerId,
      allowedCountries: ALLOWED_COUNTRIES,
      metadata: {
        referenceId: normalized.referenceId,
        kitType: normalized.kitType,
        paymentType: normalized.paymentType,
        currency: currencyForLookup,
      },
    });

    return { id: session.id, url: session.url };
  }

  private validate(params: CreateCheckoutSessionParams): NormalizedParams {
    const errors: string[] = [];

    const kitTypeRaw = (params.kitType || '').trim();
    const currencyRaw = (params.currency || '').trim();
    const rawPaymentType = (params.paymentType || '').toString().trim();
    const paymentType = rawPaymentType.toUpperCase() as OrderPaymentType;
    const referenceId = (params.referenceId || '').trim();
    const successUrl = (params.successUrl || '').trim();
    const cancelUrl = (params.cancelUrl || '').trim();
    const isAuthenticated = !!params.isAuthenticated;
    const quantity = params.quantity ?? 1;
    const isPreOrder =
      params.isPreOrder === undefined ? false : params.isPreOrder;

    const kitType = kitTypeRaw as KitType;
    if (!kitTypeRaw || !ALLOWED_KIT_TYPES.includes(kitType)) {
      errors.push('Invalid kitType');
    }

    if (!paymentType || !ALLOWED_PAYMENT_TYPES.includes(paymentType)) {
      errors.push('Invalid paymentType');
    }

    const currency = this.normalizeCurrency(currencyRaw, errors);

    if (!referenceId) {
      errors.push('referenceId is required');
    }

    const urlFields: Array<{ value: string; label: string }> = [
      { value: successUrl, label: 'successUrl' },
      { value: cancelUrl, label: 'cancelUrl' },
    ];
    for (const f of urlFields) {
      if (!f.value) {
        errors.push(`${f.label} is required`);
      } else {
        try {
          new URL(f.value);
        } catch {
          errors.push(`${f.label} must be a valid URL`);
        }
      }
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      errors.push('quantity must be an integer greater than or equal to 1');
    }

    if (isAuthenticated && !params.userId) {
      errors.push('userId is required for authenticated checkout');
    }

    if (!isAuthenticated && params.userId) {
      errors.push('userId must not be provided for guest checkout');
    }

    if (
      params.isPreOrder !== undefined &&
      typeof params.isPreOrder !== 'boolean'
    ) {
      errors.push('isPreOrder must be a boolean');
    }

    if (errors.length) {
      throw new BadRequestErrorException(errors.join('; '));
    }

    return {
      kitType,
      currency: currency as Currency,
      paymentType,
      referenceId,
      quantity,
      isPreOrder,
      isAuthenticated,
      userId: params.userId,
      successUrl,
      cancelUrl,
    };
  }

  private normalizeCurrency(
    raw: string,
    errors: string[],
  ): Currency | undefined {
    const upper = (raw || '').trim().toUpperCase();

    let normalized: Currency | undefined;
    if (upper === 'USD') normalized = Currency.USD;
    else if (upper === 'CAD') normalized = Currency.CAD;

    if (!normalized || !ALLOWED_CURRENCIES.includes(normalized)) {
      errors.push('Invalid currency');
      return undefined;
    }

    return normalized;
  }
}
