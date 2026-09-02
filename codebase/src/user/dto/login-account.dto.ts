import {
  IsEmail,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';
import { User } from '../entity/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { generateAccessToken, generateRefreshToken } from 'src/common/utils';
import { Practitioner } from 'src/practitioner/entity/practitioner.entity';

type AuthTokens = {
  access_token: string;
  refresh_token: string;
};

export class LoginAccountDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  // @IsStrongPassword({})
  password: string;

  public fromEntity(payload: User): Partial<User & AuthTokens> {
    const data: Partial<User & AuthTokens> = {};
    data.id = payload.id;
    data.firstName = payload.firstName;
    data.lastName = payload.lastName;
    data.email = payload.email;
    data.phone = payload.phone;
    data.role = payload.role;
    data.recommended = payload.recommended;
    data.emailVerifiedAt = payload.emailVerifiedAt;
    if(payload.admin) data.admin = payload.admin
    data.passwordUpdateStatus = payload.passwordUpdateStatus;
    data.access_token = generateAccessToken(payload.id, 'user_access_key');
    data.refresh_token = generateRefreshToken(payload.id, 'user_refresh_key');
    return data;
  }
}
