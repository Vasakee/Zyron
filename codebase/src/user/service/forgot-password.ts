import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundErrorException } from 'src/common';
import { generatePasswordResetToken, hashPassword } from 'src/common/utils';
import { User } from '../entity/user.entity';
import { ForgotPasswordDTO } from '../dto/forgot-password.dto';
import { FRONTEND_URL } from 'src/config';

@Injectable()
export class ForgotPasswordService {
  private readonly logger = new Logger(ForgotPasswordService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(data: ForgotPasswordDTO) {
    const email = data.email;
    const user = await this.userRepo.findOne({
      where: { email },
    });
    if (!user) {
      throw new NotFoundErrorException('Account with email does not exist.');
    }

    const token = generatePasswordResetToken();
    const hashedToken = await hashPassword(token);

    const payload = new ForgotPasswordDTO().updateEntity(user, hashedToken);

    await this.userRepo.save(payload);

    const link = `${FRONTEND_URL}/reset-password?token=${token}&email=${email}`;
    const mailData = {
      name: user.firstName,
      email: user.email,
      link,
    };

    this.eventEmitter.emit('reset.password', mailData);

    return {
      message: `An email has been sent to ${email} with instructions on how to reset password.`,
    };
  }
  catch(error) {
    this.logger.error(error);
    throw error;
  }
}
