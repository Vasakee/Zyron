import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, IsOptional, IsBoolean } from 'class-validator';

export class ConfirmPaymentMethodDto {
  @ApiProperty({
    description: 'The setup intent ID returned from the setup intent creation',
    example: 'seti_1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^seti_[a-zA-Z0-9_]+$/, {
    message: 'Invalid setup intent ID format',
  })
  setupIntentId: string;

  @ApiProperty({
    description: 'Whether to set this payment method as default. If not provided, it will be set as default automatically if the user has no valid cards or all cards are expired.',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  setAsDefault?: boolean;
}
