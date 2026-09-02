import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { BadRequestErrorException } from 'src/common';
import { Transfer } from '../entity/transfer-log.entity';
import { CompleteTransferDTO } from '../dto/transfer.dto';
import { Strategy } from 'src/enum';
const generator = require('generate-password');

@Injectable()
export class CompleteTransferService {
  private readonly logger = new Logger(CompleteTransferService.name);

  constructor(
    @InjectRepository(Transfer)
    private readonly transferRepo: Repository<Transfer>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async execute(data: CompleteTransferDTO) {
    try {
      const [transferLog] = await Promise.all([
        this.transferRepo.findOne({
          where: { newToken: data.newToken },
        }),
      ]);

      if (!transferLog) {
        throw new BadRequestErrorException(
          'Account transfer request is expired',
        );
      }

      const currentTime = new Date();

      if (transferLog.newTokenExpiresAt < currentTime.getTime()) {
        throw new BadRequestErrorException(
          'Account transfer request is expired',
        );
      }

      const payload = new CompleteTransferDTO().toEntity(transferLog);

      const result = await this.transferRepo.save(payload);

      const user = await this.userRepo.findOne({
        where: { id: transferLog.userId },
      });

      user.email = transferLog.newEmail;

      let action = 'email-changed';

      if (user.strategy === Strategy.GOOGLE) {
        const password = generator.generate({
          length: 10,
          numbers: true,
        });

        user.password = password;
        user.strategy = Strategy.NORMAL;

        action = 'reset-password';
      }

      await this.userRepo.save(user);

      return { ...result, action };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
