import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { generateAccessTokenForSignUp } from 'src/common/utils/authentication';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { ResendValidationTokenDto } from '../dto/resend-validation-token.dto';

@Injectable()
export class ResendValidationTokenService {
  private readonly logger = new Logger(ResendValidationTokenService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(data: ResendValidationTokenDto) {
    const { id } = data;
    const userRecord = await this.userRepo.findOne({ where: { id } });

    try {
      const signUpToken = await generateAccessTokenForSignUp(
        { id },
        'user_access_key',
      );

      const mailData = {
        name: userRecord.firstName,
        email: userRecord.email,
        signUpToken,
      };

      this.eventEmitter.emit('verify.account', mailData);

      return null;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
