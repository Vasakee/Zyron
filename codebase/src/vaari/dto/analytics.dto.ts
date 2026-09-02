import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PageMetaDto, PageOptionsDto } from 'src/common';

export type Granularity = 'daily' | 'weekly' | 'monthly' | 'yearly';

export class UsageAnalyticsQueryDto extends PageOptionsDto {
  @ApiPropertyOptional({
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'daily',
  })
  granularity?: Granularity;

  @ApiPropertyOptional()
  fromIso?: string;

  @ApiPropertyOptional()
  toIso?: string;

  @ApiPropertyOptional()
  search?: string;
}

export class UsageSeriesPointDto {
  @ApiProperty()
  label: string;

  @ApiProperty()
  startIso: string;

  @ApiProperty()
  endIso: string;

  @ApiProperty()
  count: number;
}

export class UsageTableItemDto {
  @ApiProperty()
  practitionerName: string;

  @ApiProperty({ nullable: true })
  kitId: string | null;

  @ApiProperty()
  analysisDateIso: string;
}

export class UsageAnalyticsDto {
  @ApiProperty()
  totalAnalyses: number;

  @ApiProperty({ type: [UsageSeriesPointDto] })
  series: UsageSeriesPointDto[];

  @ApiProperty({ type: [UsageTableItemDto] })
  table: UsageTableItemDto[];

  @ApiProperty()
  pageMetaDto: PageMetaDto;
}
