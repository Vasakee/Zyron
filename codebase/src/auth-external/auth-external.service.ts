import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { comparePassword } from 'src/common/utils';
import { Repository } from 'typeorm';
import { LoginExternalAccountDto } from './dto/login-external-account.dto';
import { ApiKey } from 'src/user/entity/api-key.entity';
import { BadRequestErrorException } from 'src/common';

@Injectable()
export class AuthExternalService {
  private readonly logger = new Logger(AuthExternalService.name);
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepo: Repository<ApiKey>,
  ) {}
  async loginAccountService(data: LoginExternalAccountDto) {
    try {
      const key = await this.apiKeyRepo.findOne({
        where: {
          clientId: data.clientId,
        },
      });

      if (!key) {
        throw new BadRequestErrorException('Authentication failed!');
      }

      const secretMatch = await comparePassword(
        data.clientSecret,
        key.clientSecret,
      );

      if (!secretMatch) {
        throw new BadRequestErrorException('Authentication failed!');
      }

      return new LoginExternalAccountDto().fromEntity(key);
    } catch (error) {
      this.logger.debug(error);
      throw error;
    }
  }
}
