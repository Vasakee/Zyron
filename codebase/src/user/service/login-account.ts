import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestErrorException } from 'src/common/filters/error-exceptions';
import {
  comparePassword,
  generateAccessTokenForSignUp,
  generatePasswordResetToken,
  hashPassword,
} from 'src/common/utils/authentication';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { LoginAccountDto } from '../dto/login-account.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PasswordUpdateStatus, Strategy } from 'src/enum';
import { FRONTEND_URL } from 'src/config';
import { ForgotPasswordDTO } from '../dto/forgot-password.dto';

@Injectable()
export class LoginAccountService {
  private readonly logger = new Logger(LoginAccountService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(data: LoginAccountDto) {
    try {
      const user = await this.userRepo.findOne({
        where: {
          email: data.email,
        },
        relations: ['admin'],
      });

      if (!user) {
        throw new BadRequestErrorException(
          'Your login credentials are incorrect ',
        );
      }

      if (user.strategy === Strategy.GOOGLE) {
        throw new BadRequestErrorException('Please login with google');
      }
      const entity = user;

      if (user && user.passwordUpdateStatus === PasswordUpdateStatus.Pending) {
        const token = generatePasswordResetToken();
        const hashedToken = await hashPassword(token);

        const payload = new ForgotPasswordDTO().updateEntity(user, hashedToken);

        await this.userRepo.save(payload);

        const link = `${FRONTEND_URL}/access-password-reset?token=${token}&email=${user.email}`;
        const mailData = {
          name: user.firstName,
          email: user.email,
          link,
        };

        this.eventEmitter.emit('new.platform.password.reset', mailData);
        return new LoginAccountDto().fromEntity(entity);
      }

      const passwordMatch = await comparePassword(data.password, user.password);

      if (!passwordMatch) {
        throw new BadRequestErrorException(
          'Your login credentials are incorrect ',
        );
      }

      if (user && !user.emailVerifiedAt) {
        const signUpToken = await generateAccessTokenForSignUp(
          { id: user.id },
          'user_access_key',
        );

        const mailData = {
          name: user.firstName,
          email: user.email,
          signUpToken,
        };

        this.eventEmitter.emit('verify.account', mailData);
      }

      return new LoginAccountDto().fromEntity(entity);
    } catch (error) {
      this.logger.debug(error);
      throw error;
    }
  }
}
