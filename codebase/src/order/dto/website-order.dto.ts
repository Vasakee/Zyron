import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Order } from '../entity/order.entity';

export class WebsiteOrderDto {
  public fromEntity(payload: Order) {
    const data: any = {};
    data.id = payload.id;
    data.orderKits = payload.orderKits;
    data.kitType = payload.kitType;
    data.country = payload.country;
    data.email = payload.email;
    data.fullName = `${payload.firstName} ${payload.lastName}`;
    data.addressLineOne = payload.addressLineOne;
    data.addressLineTwo = payload.addressLineTwo;
    data.city = payload.city;
    data.postalCode = payload.postalCode;
    data.state = payload.state;
    data.status = payload.status;
    data.kitId = payload.kitId;
    data.trackingNumber = payload.trackingNumber;
    data.trackingUrl = payload.trackingUrl;
    data.quantity = payload.quantity;
    data.shippingDate = payload.shippingDate;
    data.expectedDeliveryDate = payload.expectedDeliveryDate;
    data.deliveryMode = payload.deliveryMode;
    data.delivered = payload.delivered;
    data.dateDelivered = payload.dateDelivered;
    data.createdAt = payload.createdAt;
    return data;
  }
}

export class UpdateShippingDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  trackingNumber: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  trackingUrl: string;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  shippingDate: Date;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  quantity: number;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  kitIds: string[];

  public updateEntity(data: Order, payload: UpdateShippingDto) {
    if (payload.shippingDate) data.shippingDate = payload.shippingDate;
    if (payload.trackingUrl) data.trackingUrl = payload.trackingUrl;
    if (payload.trackingNumber) data.trackingNumber = payload.trackingNumber;
    if (payload.quantity) data.quantity = payload.quantity;

    return data;
  }
}
