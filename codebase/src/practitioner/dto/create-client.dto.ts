import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { AccountRoles, PractitionerAccessStatus } from 'src/enum';
import { CreateClientPractitionerDto } from 'src/user/dto/client-practitioner.dto';
import { User } from 'src/user/entity/user.entity';
import { ExternalPractitioner } from '../entity/external-practitioner.entity';
type AuthTokens = {
  access_token: string;
  refresh_token: string;
};

export class CreateClienttDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
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
  @IsEnum([...Object.values(PractitionerAccessStatus)])
  @IsString()
  reportAccess: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  practitionerId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  receiveMarketing: number;

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

  public toEntity(
    payload: CreateClienttDto,
    passwordHash: string,
    token: string,
  ) {
    const data = new User();
    data.firstName = payload.firstName;
    data.lastName = payload.lastName;
    data.email = payload.email;
    data.receiveMarketing = payload.receiveMarketing ? 1 : 0;
    data.clientPractitioners =
      payload.practitionerId === 'not-found'
        ? null
        : [new CreateClientPractitionerDto().toEntity(payload as any)];
    data.recommended = payload.recommended;
    data.role = AccountRoles.USER;
    if (payload.phone) data.phone = payload.phone;
    data.password = passwordHash;
    data.resetPasswordToken = token;
    const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
    data.resetPasswordExpire = date.getTime();
    return data;
  }

  public toExternalPractitionerEntity(
    payload: CreateClienttDto,
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
    data.recommended = payload.recommended;
    data.receiveMarketing = payload.receiveMarketing;
    data.avatar = payload.avatar;
    data.practitioner = payload.practitioner;
    data.createdAt = payload.createdAt;
    data.updatedAt = payload.updatedAt;
    return data;
  }
}
