import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { BadRequestErrorException } from 'src/common';
import { generatePasswordResetToken } from 'src/common/utils';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Transfer } from '../entity/transfer-log.entity';
import { VerifyTransferDTO } from '../dto/transfer.dto';
import { TransferStatus } from 'src/enum';
@Injectable()
export class VerifyTransferService {
  private readonly logger = new Logger(VerifyTransferService.name);

  constructor(
    @InjectRepository(Transfer)
    private readonly transferRepo: Repository<Transfer>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(data: VerifyTransferDTO) {
    try {
      const [transferLog] = await Promise.all([
        this.transferRepo.findOne({
          where: { oldToken: data.oldToken },
          relations: ['user'],
        }),
      ]);

      if (!transferLog) {
        throw new BadRequestErrorException(
          'Account transfer request is expired',
        );
      }

      const currentTime = new Date();

      if (transferLog.oldTokenExpiresAt < currentTime.getTime()) {
        throw new BadRequestErrorException(
          'Account transfer request is expired',
        );
      }

      const token = generatePasswordResetToken();

      const payload = new VerifyTransferDTO().toEntity(
        transferLog,
        token,
        data,
      );

      const result = await this.transferRepo.save(payload);

      if (data.status === TransferStatus.REJECTED) {
        return result;
      }

      const mailData = {
        name: transferLog.user.firstName,
        email: transferLog.user.email,
        newEmail: transferLog.newEmail,
        token,
      };

      this.eventEmitter.emit('verify.transfer.account', mailData);

      return result;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
