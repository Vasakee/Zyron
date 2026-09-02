import { Injectable } from '@nestjs/common';
import { BaseOrderService } from './base-order.service';
import { OrderDto } from '../dto/create-order.dto';
import { OrderType } from 'src/enum';
import { chargePaymentMethodService as ChargePaymentMethodService } from 'src/payment/services/charge-payment-method';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RetrievePriceService } from 'src/payment/services/retrieve-price';
import { StripePriceService } from 'src/payment/services/stripe-price.service';
import { CreateCheckoutSessionService } from 'src/payment/services/create-checkout-session.service';

@Injectable()
export class CreateKitOnsiteOrderService extends BaseOrderService {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    createCheckoutSessionService: CreateCheckoutSessionService,
    chargePaymentMethodService: ChargePaymentMethodService,
    retrievePriceService: RetrievePriceService,
    stripePriceService: StripePriceService,
  ) {
    super(
      dataSource,
      createCheckoutSessionService,
      chargePaymentMethodService,
      retrievePriceService,
      stripePriceService,
    );
  }

  async execute(data: OrderDto) {
    return super.execute(data, OrderType.KitOnSite);
  }
}
