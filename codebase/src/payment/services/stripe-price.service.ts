import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StripePrice } from '../entity/stripe-price.entity';
import { OrderPaymentType } from 'src/enum';
import { BadRequestErrorException } from 'src/common/filters';

export type StripePriceLookupParams = {
  kitType: string;
  paymentType: OrderPaymentType | string;
  currency: string;
};

export type StripePriceLookupOptions = {
  isPreOrder?: boolean;
};

export class StripePriceNotFoundError extends Error {
  code = 'STRIPE_PRICE_NOT_FOUND';
  context: StripePriceLookupParams;

  constructor(context: StripePriceLookupParams) {
    super(
      'Active Stripe price not found for given kitType/paymentType/currency',
    );
    this.context = context;
  }
}

@Injectable()
export class StripePriceService {
  constructor(
    @InjectRepository(StripePrice)
    private readonly stripePriceRepo: Repository<StripePrice>,
  ) {}

  async findActivePriceOrThrow(
    params: StripePriceLookupParams,
    options: StripePriceLookupOptions = {},
  ): Promise<{ price: StripePrice; stripePriceId: string }> {
    const { kitType, paymentType, currency } = params;

    const price = await this.stripePriceRepo.findOne({
      where: {
        kitType,
        paymentType,
        currency,
        isActive: Number(true),
      },
    });

    if (!price) {
      throw new StripePriceNotFoundError(params);
    }

    const isPreOrder = !!options.isPreOrder;
    const stripePriceId = isPreOrder
      ? price.preOrderPriceId?.trim()
      : price.stripePriceId;
    if (isPreOrder && !stripePriceId) {
      throw new BadRequestErrorException(
        'Pre-order price is not configured for the selected kit and currency',
      );
    }

    return { price, stripePriceId };
  }
}
