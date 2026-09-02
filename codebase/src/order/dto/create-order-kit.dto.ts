import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { OrderKit } from '../entity/order-kit.entity';

export class OrderKitsDto {
  public fromEntity(payload: OrderKit) {
    const data = new OrderKit();
    data.orderId = payload.orderId;
    data.kitId = payload.kitId;
    data.registeredBy = payload.registeredBy;
    data.registrationStatus = payload.registrationStatus
    return data;
  }
}

export class OrdersKitQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchQuery: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  status: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  registrationStatus: string;
}
