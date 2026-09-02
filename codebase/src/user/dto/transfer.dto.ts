import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { User } from '../entity/user.entity';
import { Transfer } from '../entity/transfer-log.entity';
import { TransferStatus } from 'src/enum';

export class InitiateTransferDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  newEmail: string;

  userId: string;

  public toEntity(payload: InitiateTransferDTO, oldEmail, token) {
    const data = new Transfer();
    data.userId = payload.userId;
    data.newEmail = payload.newEmail;
    data.oldEmail = oldEmail;
    data.oldToken = token;
    data.oldTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    ).getTime();
    return data;
  }

  public updateEntity(user: User, token: string) {
    user.resetPasswordToken = token;
    const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
    user.resetPasswordExpire = date.getTime();
    return user;
  }
}

export class VerifyTransferDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  oldToken: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  status: string;

  public toEntity(transferLog: Transfer, token, payload: VerifyTransferDTO) {
    transferLog.newToken = token;
    transferLog.newTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    ).getTime();
    transferLog.oldTokenExpiresAt = new Date(Date.now()).getTime();
    transferLog.status = payload.status;

    return transferLog;
  }
}

export class CompleteTransferDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  newToken: string;

  public toEntity(transferLog: Transfer) {
    transferLog.newTokenExpiresAt = new Date(Date.now()).getTime();
    transferLog.status = TransferStatus.COMPLETED;

    return transferLog;
  }
}
