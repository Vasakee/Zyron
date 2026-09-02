import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { KitType } from 'src/enum';

export class PaymentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  paymentMethodId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  country?: string;

  @ApiPropertyOptional()
  @IsEnum([...Object.values(KitType)])
  @IsString()
  @IsOptional()
  kitType: string;

  @ApiPropertyOptional({
    description: 'Whether this is a pre-order purchase',
    type: Boolean,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPreOrder?: boolean;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'Quantity must be greater than 0' })
  quantity: number;
}
