import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class setSubmittedDto {
  @ApiProperty()
  @IsString()
  kitId: string;

  @ApiProperty()
  submitted: boolean;
}
