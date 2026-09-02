import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUsageDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  kitId: string;

  userId?: string;
}
