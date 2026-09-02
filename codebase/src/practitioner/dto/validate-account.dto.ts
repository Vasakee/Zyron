import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateAccountDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}
