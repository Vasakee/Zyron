import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsArray,
  IsUUID,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Order } from 'src/common';
import { OneToMany } from 'typeorm';
import { OrderDto } from './create-order.dto';

export class CreateShippingPackageDto {
  @ApiPropertyOptional({ description: 'Tracking number' })
  @IsString()
  trackingNumber?: string;

  @ApiPropertyOptional({ description: 'URL of shipping label' })
  @IsString()
  trackingUrl?: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  orderId: string;
}
