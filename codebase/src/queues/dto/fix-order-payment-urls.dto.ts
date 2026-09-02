import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class FixOrderPaymentUrlsQueryDto {
  @ApiPropertyOptional({
    description: 'Number of orders to process in each batch (default: 500)',
    minimum: 1,
    maximum: 1000,
    default: 500,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  batchSize?: number;
}
