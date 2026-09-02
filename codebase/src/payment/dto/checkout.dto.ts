import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Currency } from 'src/enum';

export class CheckoutDto {
  @ApiProperty()
  @IsEnum(Currency)
  @IsNotEmpty()
  currency: Currency;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  quantity?: number;
}

export class FirstWaitlistCheckoutDto {
  @ApiProperty()
  @IsEnum(Currency)
  @IsNotEmpty()
  currency: Currency;

  firstName: string;
  lastName: string;
  email: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  quantity?: number;
}

export class SecondWaitlistCheckoutDto {
  @ApiProperty()
  @IsEnum(Currency)
  @IsNotEmpty()
  currency: Currency;

  initialReferenceId: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  quantity: number;
}
