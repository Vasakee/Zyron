import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Validate,
} from 'class-validator';
import { User } from '../entity/user.entity';
import {
  AccountRoles,
  IdentifierType,
  PractitionerAccessStatus,
} from 'src/enum';
import { generateAccessToken, generateRefreshToken } from 'src/common/utils';
import { ExternalPractitioner } from 'src/practitioner/entity/external-practitioner.entity';

import { CreateClientPractitionerDto } from './client-practitioner.dto';
type AuthTokens = {
  access_token: string;
  refresh_token: string;
};

export class CreateCustomerAccountDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  recommended: string;

  @ApiProperty()
  // @IsEnum([...Object.values(PractitionerAccessStatus)])
  @IsString()
  reportAccess: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  practitionerId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  awarenessChannel: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  receiveMarketing: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsEnum([...Object.values(AccountRoles)])
  role: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

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

  public toEntity(payload: CreateCustomerAccountDto, passwordHash: string) {
    const data = new User();
    data.firstName = payload.firstName;
    data.lastName = payload.lastName;
    data.email = payload.email;
    data.awarenessChannel = payload.awarenessChannel;
    data.receiveMarketing = payload.receiveMarketing ? 1 : 0;
    if (payload.practitionerId)
      data.clientPractitioners =
        payload.practitionerId === 'not-found'
          ? null
          : [new CreateClientPractitionerDto().toEntity(payload as any)];
    data.recommended = payload.recommended;
    data.role = AccountRoles.USER;
    if (payload.phone) data.phone = payload.phone;
    data.password = passwordHash;
    return data;
  }

  public toExternalPractitionerEntity(
    payload: CreateCustomerAccountDto,
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

  public fromEntity(payload: User) {
    const data = new User();
    data.id = payload.id;
    data.firstName = payload.firstName;
    data.lastName = payload.lastName;
    data.email = payload.email;
    data.phone = payload.phone;
    data.role = payload.role;
    data.recommended = payload.recommended;
    data.clientPractitioners = payload.clientPractitioners;
    data.clientExternalPractitioner = payload.clientExternalPractitioner;
    data.receiveMarketing = payload.receiveMarketing;
    data.avatar = payload.avatar;
    data.practitioner = payload.practitioner;
    data.monthlyBillingAccess = payload.monthlyBillingAccess;
    if (payload.admin) data.admin = payload.admin;
    data.createdAt = payload.createdAt;
    data.updatedAt = payload.updatedAt;
    return data;
  }
}

export class CompleteClientRegistrationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty()
  @IsString()
  @IsEnum([...Object.values(IdentifierType)])
  identifierType: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  recommended: string;

  @ApiProperty()
  // @IsEnum([...Object.values(PractitionerAccessStatus)])
  @IsString()
  reportAccess: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  practitionerId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  awarenessChannel: string;

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

  public updateEntity(data: User, payload: CompleteClientRegistrationDto) {
    data.awarenessChannel = payload.awarenessChannel;
    if (payload.practitionerId)
      data.clientPractitioners =
        payload.practitionerId === 'not-found'
          ? null
          : [new CreateClientPractitionerDto().toEntity(payload as any)];
    data.recommended = payload.recommended;
    return data;
  }

  public toExternalPractitionerEntity(
    payload: CompleteClientRegistrationDto,
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

  public fromEntity(payload: User) {
    const data: Partial<User & AuthTokens> = {};
    data.id = payload.id;
    data.firstName = payload.firstName;
    data.lastName = payload.lastName;
    data.email = payload.email;
    data.phone = payload.phone;
    data.role = payload.role;
    data.recommended = payload.recommended;
    data.access_token = generateAccessToken(payload.id, 'user_access_key');
    data.refresh_token = generateRefreshToken(payload.id, 'user_refresh_key');
    return data;
  }
}
