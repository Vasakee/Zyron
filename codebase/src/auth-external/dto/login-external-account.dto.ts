import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { generateExternalAccessToken } from 'src/common/utils';
import { ApiKey } from 'src/user/entity/api-key.entity';

type AuthTokens = {
  username: string;
  access_token: string;
  ttl: number;
};

export class LoginExternalAccountDto {
  @ApiProperty()
  @IsString()
  clientId: string;

  @ApiProperty()
  @IsString()
  clientSecret: string;

  public fromEntity(payload: ApiKey): AuthTokens {
    const data: AuthTokens = {
      username: payload.username,
      access_token: generateExternalAccessToken(
        payload.username,
        'user_access_key',
      ),
      ttl: 60 * 60 * 10,
    };
    return data;
  }
}

export class LoginExternalResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  ttl: string;
}
