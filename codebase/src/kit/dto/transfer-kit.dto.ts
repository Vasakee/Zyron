import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class TransferKitDto {
  @ApiProperty({
    description: 'Email address of the practitioner to transfer the kit to',
    example: 'practitioner@example.com',
    type: 'string',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Name of the client for the kit',
    example: 'John Doe',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The unique id of the kit to transfer',
    example: 'VT1-CCCCC',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  kitId: string;
}
