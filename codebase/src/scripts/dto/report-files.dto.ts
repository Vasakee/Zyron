import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReportDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  kitId: string;
}
