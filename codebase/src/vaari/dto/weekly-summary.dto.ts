import { ApiProperty } from '@nestjs/swagger';

export class WeeklySummaryDto {
  @ApiProperty()
  windowStartIso: string;

  @ApiProperty()
  windowEndIso: string;

  @ApiProperty()
  used: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  remaining: number;

  @ApiProperty()
  nextResetIso: string;
}
