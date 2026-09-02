import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Practitioner } from '../entity/practitioner.entity';

export class UpdatePractitionerAccountStatusDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  status?: string;

  public toEntity(
    data: Practitioner,
    payload: UpdatePractitionerAccountStatusDto,
  ) {
    data.status = payload.status;
    return data;
  }
}
