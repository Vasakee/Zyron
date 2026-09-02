import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { User } from '../entity/user.entity';
import { PasswordUpdateStatus } from 'src/enum';

export class ResetNewPlatformPasswordDTO {
  @IsString()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  @MinLength(6)
  password: string;

  @IsString()
  @ApiProperty()
  @MinLength(6)
  confirmPassword: string;

  public updateEntity(user: User, password: string) {
    user.resetPasswordExpire = null;
    user.resetPasswordToken = null;
    user.passwordUpdateStatus = PasswordUpdateStatus.Completed;
    user.password = password;
    return user;
  }
}
