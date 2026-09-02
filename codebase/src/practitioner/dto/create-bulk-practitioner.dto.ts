import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Practitioner } from '../entity/practitioner.entity';
import {
  AccountRoles,
  PasswordUpdateStatus,
  PractitionerAccountStatus,
} from 'src/enum';
import { User } from 'src/user/entity/user.entity';

export class CreateBulkPractitionerAccountDto {
  @ApiProperty()
  csvFile: string;
}

export class ValidatePractitionerAccountDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  practice_name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  url: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  qualifications: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  practitioner_type: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  listing_status: string;

  password: string;

  public toPractitionerEntity(payload: ValidatePractitionerAccountDto) {
    const data = new Practitioner();
    data.practiceName = payload.practice_name;
    data.practiceUrl = payload.url;
    data.status = payload.listing_status.toLowerCase();
    data.degree = payload.qualifications;
    data.practitionerType = payload.practitioner_type;
    return data;
  }

  public toEntity(
    payload: ValidatePractitionerAccountDto,
    passwordHash: string,
  ) {
    const data = new User();
    data.firstName = payload.first_name;
    data.lastName = payload.last_name;
    data.email = payload.email;
    data.role = AccountRoles.PRACTITIONER;
    data.password = passwordHash;
    data.passwordUpdateStatus = PasswordUpdateStatus.Pending;
    data.practitioner = this.toPractitionerEntity(payload);
    return data;
  }
}
