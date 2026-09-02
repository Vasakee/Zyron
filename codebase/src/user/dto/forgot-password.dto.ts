import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { User } from '../entity/user.entity';

export class ForgotPasswordDTO {
  @IsEmail()
  @IsString()
  @ApiProperty()
  email: string;

  public updateEntity(user: User, token: string) {
    user.resetPasswordToken = token;
    const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
    user.resetPasswordExpire = date.getTime();
    return user;
  }
}
