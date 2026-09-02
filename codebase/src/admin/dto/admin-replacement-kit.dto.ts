import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AllowedCountriesAbbrev,
  Currency,
  KitType,
  ReplacementKitStatus,
  ReplacementKitTargetType,
} from 'src/enum';

export class ReplacementKitRequestResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  referenceId: string;

  @ApiProperty({ enum: ReplacementKitTargetType })
  targetType: ReplacementKitTargetType;

  @ApiPropertyOptional({ nullable: true })
  practitionerId?: string | null;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: KitType })
  kitType: KitType;

  @ApiProperty({ enum: Currency })
  currency: Currency;

  @ApiProperty()
  quantity: number;

  @ApiProperty({ enum: AllowedCountriesAbbrev })
  country: AllowedCountriesAbbrev;

  @ApiProperty()
  addressLineOne: string;

  @ApiPropertyOptional({ nullable: true })
  addressLineTwo?: string | null;

  @ApiProperty()
  city: string;

  @ApiProperty()
  state: string;

  @ApiProperty()
  postalCode: string;

  @ApiProperty({ enum: ReplacementKitStatus })
  status: ReplacementKitStatus;

  @ApiPropertyOptional({ nullable: true })
  paymentUrl?: string | null;

  @ApiPropertyOptional({ nullable: true })
  paymentSessionId?: string | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  paymentDate?: string | null;

  @ApiProperty()
  createdByAdminId: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  createdAt?: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  updatedAt?: string;
}

export class ReplacementKitCheckoutLinkResponseDataDto {
  @ApiProperty()
  url: string;

  @ApiPropertyOptional()
  sessionId?: string;
}

export class ReplacementKitRequestCreateResponseDto {
  @ApiProperty()
  status: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: ReplacementKitRequestResponseDto })
  data: ReplacementKitRequestResponseDto;
}

export class ReplacementKitCheckoutLinkResponseDto {
  @ApiProperty()
  status: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: ReplacementKitCheckoutLinkResponseDataDto })
  data: ReplacementKitCheckoutLinkResponseDataDto;
}

export class ReplacementKitRequestListResponseDto {
  @ApiProperty()
  status: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: [ReplacementKitRequestResponseDto] })
  data: ReplacementKitRequestResponseDto[];
}
