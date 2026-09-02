import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsISO8601, IsOptional } from 'class-validator';

export class UsageSeriesDto {
  @ApiPropertyOptional({
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'daily',
  })
  @IsIn(['daily', 'weekly', 'monthly', 'yearly'])
  granularity: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily';

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  fromIso?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  toIso?: string;
}
