import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResendValidationTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
