import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { KitType, Currency } from 'src/enum';

export class GuestCheckoutDto {
  @ApiProperty({ enum: KitType })
  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(KitType) as unknown as string[])
  kitType: KitType;

  @ApiProperty({ enum: Currency })
  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(Currency) as unknown as string[])
  currency: Currency;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(1)
  quantity?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  successUrl: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cancelUrl: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isPreOrder?: boolean;
}
