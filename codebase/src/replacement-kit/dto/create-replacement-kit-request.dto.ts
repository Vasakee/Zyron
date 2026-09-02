import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  AllowedCountriesAbbrev,
  Currency,
  ReplacementKitTargetType,
  KitType,
} from 'src/enum';

export class AddressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  addressLineOne: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  addressLineTwo?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({ enum: AllowedCountriesAbbrev })
  @IsEnum(AllowedCountriesAbbrev)
  country: AllowedCountriesAbbrev;
}

export class CreateReplacementKitRequestDto {
  @ApiProperty({ enum: ReplacementKitTargetType })
  @IsEnum(ReplacementKitTargetType)
  targetType: ReplacementKitTargetType; // PRACTITIONER | CLIENT

  @ApiPropertyOptional()
  @ValidateIf((o) => o.targetType === 'PRACTITIONER')
  @IsString()
  @IsNotEmpty()
  practitionerId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ enum: KitType })
  @IsEnum(KitType)
  kitType: KitType;

  @ApiProperty({ enum: Currency })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}

export class ReplacementRequestIdParamDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class CheckoutLinkResponseDto {
  @ApiProperty()
  url: string;

  @ApiPropertyOptional()
  sessionId?: string;
}
