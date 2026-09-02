import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { User } from '../entity/user.entity';
import { ExternalPractitioner } from 'src/practitioner/entity/external-practitioner.entity';
import { PasswordUpdateStatus, PractitionerAccessStatus } from 'src/enum';
import { CreateClientPractitionerDto } from './client-practitioner.dto';

export class UpdateCustomerAccountDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  recommended?: string;

  @ApiProperty()
  // @IsEnum([...Object.values(PractitionerAccessStatus)])
  @IsString()
  @IsOptional()
  reportAccess: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  practitionerId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  practitionerLastName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  practitionerFirstName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  practitionerEmail: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  practitionerWebsiteUrl: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  practitionerPhone: string;

  public toEntity(payload: UpdateCustomerAccountDto, data: User) {
    data.firstName = payload.firstName;
    data.lastName = payload.lastName;
    data.clientPractitioners =
      !payload.practitionerId || payload.practitionerId === 'not-found'
        ? null
        : [new CreateClientPractitionerDto().toEntity(payload as any)];
    data.recommended = payload.recommended;
    // data.passwordUpdateStatus = PasswordUpdateStatus.Pending;
    if (payload.phone) data.phone = payload.phone;
    return data;
  }

  public toExternalPractitionerEntity(
    payload: UpdateCustomerAccountDto,
    userId: string,
  ) {
    const data = new ExternalPractitioner();
    data.userId = userId;
    data.firstName = payload.practitionerFirstName;
    data.lastName = payload.practitionerLastName;
    data.email = payload.practitionerEmail;
    data.websiteUrl = payload.practitionerWebsiteUrl;
    data.phone = payload.practitionerPhone;
    return data;
  }

  public updateExternalPractitionerEntity(
    payload: UpdateCustomerAccountDto,
    data: ExternalPractitioner,
  ) {
    data.firstName = payload.practitionerFirstName;
    data.lastName = payload.practitionerLastName;
    data.email = payload.practitionerEmail;
    data.websiteUrl = payload.practitionerWebsiteUrl;
    data.phone = payload.practitionerPhone;
    return data;
  }
}
