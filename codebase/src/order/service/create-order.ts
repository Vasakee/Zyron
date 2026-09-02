import { Injectable } from '@nestjs/common';
import { CreateKitOnsiteOrderService } from './create-kit-onsite-order.service';
import { CreateBulkOrderService } from './create-bulk-order.service';
import { CreatePaygOrderService } from './create-payg-order.service';
import { OrderDto } from '../dto/create-order.dto';
import { OrderType } from 'src/enum';

@Injectable()
export class CreateOrderService {
  constructor(
    private readonly createKitOnsiteOrderService: CreateKitOnsiteOrderService,
    private readonly createBulkOrderService: CreateBulkOrderService,
    private readonly createPayAsYouGoOrderService: CreatePaygOrderService,
  ) {}

  async execute(data: OrderDto, orderType: OrderType = OrderType.KitOnSite) {
    switch (orderType) {
      case OrderType.KitOnSite:
        return this.createKitOnsiteOrderService.execute(data);

      case OrderType.MonthlyBilling:
        return this.createBulkOrderService.execute(data);

      case OrderType.PayAsYouGo:
        return this.createPayAsYouGoOrderService.execute(data);

      default:
        throw new Error('Invalid order type');
    }
  }
}
