import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional } from 'class-validator';

export class SetMonthlyBillingAccessDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  enable: boolean;
}

export class BulkMonthlyBillingAccessDto {
  @ApiPropertyOptional({
    description:
      'Flag indicating whether to enable (true) or disable (false) access for all listed emails',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  enable?: boolean;
}
