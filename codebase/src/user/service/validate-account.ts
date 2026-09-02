import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConflictErrorException,
  ForbiddenErrorException,
} from 'src/common/filters/error-exceptions';
import { verifySignUpToken } from 'src/common/utils/authentication';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { LoginAccountDto } from '../dto/login-account.dto';
import { ValidateAccountDto } from '../dto/validate-account.dto';
import { Practitioner } from 'src/practitioner/entity/practitioner.entity';

@Injectable()
export class ValidateAccountService {
  private readonly logger = new Logger(ValidateAccountService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async execute(data: ValidateAccountDto) {
    try {
      const { token } = data;
      const decoded = await verifySignUpToken(token);

      if (!decoded) {
        return { expired: true };
      }

      const userRecord = await this.userRepo.findOne({
        where: { id: decoded.id },
      });

      if (!userRecord)
        throw new ConflictErrorException('Account does not exist');

      if (userRecord.emailVerifiedAt) {
        return new LoginAccountDto().fromEntity(userRecord);
      }

      const emailVerifiedAt = new Date();
      await this.userRepo.update(decoded.id, { emailVerifiedAt });
      userRecord.emailVerifiedAt = emailVerifiedAt;
      return new LoginAccountDto().fromEntity(userRecord);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
