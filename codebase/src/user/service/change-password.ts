import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { comparePassword, hashPassword } from 'src/common/utils';
import { BadRequestErrorException } from 'src/common';

@Injectable()
export class ChangeUserPasswordService {
  private readonly logger = new Logger(ChangeUserPasswordService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async execute(data: ChangePasswordDto) {
    try {
      const userRecord = await this.userRepo.findOne({
        where: { id: data.userId },
      });
      const match = await comparePassword(
        data.oldPassword,
        userRecord.password,
      );

      if (!match) {
        throw new BadRequestErrorException(
          'The provided password is incorrect',
        );
      }

      // check IF new password is same as old
      if (await comparePassword(data.password, userRecord.password)) {
        throw new BadRequestErrorException(
          'New password must be different from the old one',
        );
      }

      const password = await hashPassword(data.password);

      await this.userRepo.update(data.userId, {
        password,
      });

      return null;
    } catch (error) {
      this.logger.log(error);
      throw error;
    }
  }
}
