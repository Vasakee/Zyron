import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Order } from '../entity/order.entity';
import { CreateShippingPackageDto } from './create-shipping-package.dto';
import { Type } from 'class-transformer';

export class UpdateOrderDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  trackingNumber: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  trackingUrl: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  quantity: number;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  kitIds: string[];

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  shippingDate: Date;

  trackingEmailStatus: boolean;

  @ApiProperty({
    type: [CreateShippingPackageDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateShippingPackageDto)
  @IsOptional()
  extraPackages: CreateShippingPackageDto[];

  public updateEntity(data: Order, payload: UpdateOrderDto) {
    if (payload.shippingDate) data.shippingDate = payload.shippingDate;
    if (payload.trackingUrl) data.trackingUrl = payload.trackingUrl;
    if (payload.trackingNumber) data.trackingNumber = payload.trackingNumber;
    if (payload.quantity) data.quantity = payload.quantity;
    if (payload?.extraPackages?.length)
      data.extraPackages = payload.extraPackages;
    return data;
  }

  public fromEntity(payload: Order) {
    const data = new Order();
    data.id = payload.id;
    data.kitId = payload.kitId;
    data.status = payload.status;
    data.registeredBy = payload.registeredBy;
    data.registrationStatus = payload.registrationStatus;
    data.shippingDate = payload.shippingDate;
    data.trackingNumber = payload.trackingNumber;
    data.trackingUrl = payload.trackingUrl;
    data.trackingEmailStatus = payload.trackingEmailStatus;
    data.expectedDeliveryDate = payload.expectedDeliveryDate;
    data.deliveryMode = payload.deliveryMode;

    data.createdAt = payload.createdAt;
    return data;
  }
}
