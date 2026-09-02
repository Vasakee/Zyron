/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictErrorException } from 'src/common';
import { generateAccessTokenForSignUp, hashPassword } from 'src/common/utils';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from 'src/user/entity/user.entity';
import { CreateAdminDto } from '../dto/admin.dto';

@Injectable()
export class CreateAdminAccountService {
  private readonly logger = new Logger(CreateAdminAccountService.name);
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(data: CreateAdminDto) {
    try {
      const userRecord = await this.userRepo.findOne({
        where: { email: data.email },
      });

      if (userRecord) {
        throw new ConflictErrorException('Account already exists');
      }

      const passwordHash = await hashPassword(data.password);

      const Dto = new CreateAdminDto();
      const payload = Dto.toEntity(data, passwordHash);

      const result = await this.userRepo.save(payload);

      const signUpToken = await generateAccessTokenForSignUp(
        { id: result.id },
        'user_access_key',
      );

      const mailData = {
        name: result.firstName,
        email: result.email,
        signUpToken,
      };

      this.eventEmitter.emit('verify.account', mailData);

      return Dto.fromEntity(result);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
