import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class StripeUpsertSessionsQueryDto {
  @ApiPropertyOptional({
    description:
      'Unix timestamp (in seconds) to filter sessions created from this time onwards',
  })
  @IsOptional()
  createdFrom?: number;

  @ApiPropertyOptional({
    description:
      'Unix timestamp (in seconds) to filter sessions created up to this time',
  })
  @IsOptional()
  createdTo?: number;
}
