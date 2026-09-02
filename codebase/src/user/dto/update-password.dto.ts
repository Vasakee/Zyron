import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { User } from '../entity/user.entity';

export class UpdatePasswordDto {
  @ApiProperty()
  @IsString()
  oldPassword: string;

  @ApiProperty()
  @IsString()
  newPassword: string;

  public updateEntity(
    data: User,
    payload: UpdatePasswordDto,
    passwordHash: string,
  ) {
    data.password = passwordHash;
    return data;
  }

  public fromEntity(payload: User) {
    const data = new User();
    data.id = payload.id;
    data.firstName = payload.firstName;
    data.email = payload.email;
    data.phone = payload.phone;
    data.recommended = payload.recommended;
    data.avatar = payload.avatar;
    // data.created_at = payload.created_at;
    // data.updatedAt = payload.updatedAt;
    return data;
  }
}
