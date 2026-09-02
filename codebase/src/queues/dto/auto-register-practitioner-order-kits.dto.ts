import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class AutoRegisterPractitionerOrderKitsQueryDto {
  @ApiProperty({
    description: 'The ID of the order to auto-register kits for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsUUID()
  @IsString()
  @IsUUID()
  orderId: string;

  @ApiProperty({
    description: 'The ID of the kit to auto-register',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsUUID()
  kitId: string;
}



