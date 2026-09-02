import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { ResetPasswordDTO } from '../dto/reset-password.dto';
import { BadRequestErrorException } from 'src/common';
import { comparePassword, hashPassword } from 'src/common/utils';

@Injectable()
export class ResetPasswordService {
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

      const tokenMatch = await comparePassword(token, user.resetPasswordToken);

      if (!tokenMatch) {
        throw new BadRequestErrorException(
          'Token generated does not match token provided.',
        );
      }

      const currentTime = new Date();

      if (user.resetPasswordExpire < currentTime.getTime()) {
        throw new Error('Token has expired.');
      }

      const hashedPassword = await hashPassword(password);

      const payload = new ResetPasswordDTO().updateEntity(user, hashedPassword);
      this.userRepo.save(payload);

      return null;
    } catch (error) {
      throw error;
    }
  }
}
