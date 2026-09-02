import { Injectable } from '@nestjs/common';
import * as uuid from 'uuid';
import { CreateCheckoutSessionService } from './create-checkout-session.service';
import { Currency, KitType, OrderPaymentType } from 'src/enum';

@Injectable()
export class GuestCheckoutService {
  constructor(
    private readonly createCheckoutSessionService: CreateCheckoutSessionService,
  ) {}

  async execute(params: {
    kitType: KitType;
    currency: Currency;
    quantity?: number;
    successUrl: string;
    cancelUrl: string;
    isPreOrder?: boolean;
  }): Promise<{ referenceId: string; sessionId: string; url: string }> {
    const referenceId = uuid.v4();

    const session = await this.createCheckoutSessionService.execute({
      kitType: params.kitType,
      currency: params.currency,
      paymentType: OrderPaymentType.WEBSITE_ORDER,
      referenceId,
      quantity: params.quantity,
      isAuthenticated: false,
      successUrl: params.successUrl,
      cancelUrl: params.cancelUrl,
      isPreOrder: params.isPreOrder ?? false,
    });

    return { referenceId, sessionId: session.id, url: session.url };
  }
}
