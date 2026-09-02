import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { ResetPasswordDTO } from '../dto/reset-password.dto';
import { BadRequestErrorException, ForbiddenErrorException } from 'src/common';
import { comparePassword, hashPassword } from 'src/common/utils';
import { LoginAccountDto } from '../dto/login-account.dto';

@Injectable()
export class CreatePasswordService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async execute(data: ResetPasswordDTO, token: string) {
    try {
      const { email, password, confirmPassword } = data;
      if (password !== confirmPassword) {
        throw new BadRequestErrorException(
          'Password and confirm password must match.',
        );
      }
      const user = await this.userRepo.findOne({ where: { email } });

      if (!user.resetPasswordToken) {
        throw new ForbiddenErrorException(
          'This token has been implemented once.',
        );
      }

      const tokenMatch = await comparePassword(token, user.resetPasswordToken);

      if (!tokenMatch) {
        throw new BadRequestErrorException(
          'Token generated does not match token provided.',
        );
      }

      const currentTime = new Date();

      if (user.resetPasswordExpire < currentTime.getTime()) {
        throw new ForbiddenErrorException('Token has expired.');
      }

      const hashedPassword = await hashPassword(password);

      const payload = new ResetPasswordDTO().updateEntity(user, hashedPassword);
      const result = await this.userRepo.save(payload);

      return new LoginAccountDto().fromEntity(result);
    } catch (error) {
      throw error;
    }
  }
}
