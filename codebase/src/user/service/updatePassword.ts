/* eslint-disable prettier/prettier */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { UpdateCustomerAccountDto } from '../dto/update-account.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { hashPassword, comparePassword } from 'src/common/utils';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { BadRequestErrorException } from 'src/common/filters/error-exceptions';

@Injectable()
export class UpdatePasswordService {
  private readonly logger = new Logger(UpdatePasswordService.name);
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string, data: UpdatePasswordDto) {
    try {
      const user = await this.userRepo.findOne({
        where: {
          id: id,
        },
      });
      if (!user) {
        throw new BadRequestErrorException('User not found');
      }
      const passwordMatch = await comparePassword(
        data.oldPassword,
        user.password,
      );
      if (!passwordMatch) {
        throw new BadRequestErrorException(
          'This is not your old password, try again',
        );
      }
      const passwordHash = await hashPassword(data.newPassword);

      return this.userRepo.update({ id }, { password: passwordHash });
    } catch (err) {
      throw new BadRequestErrorException('Error updating User');
    }
  }
}
