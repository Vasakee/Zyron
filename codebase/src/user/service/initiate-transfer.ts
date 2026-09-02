import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { ConflictErrorException } from 'src/common';
import { generatePasswordResetToken, hashPassword } from 'src/common/utils';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Transfer } from '../entity/transfer-log.entity';
import { InitiateTransferDTO } from '../dto/transfer.dto';
@Injectable()
export class InitiateTransferService {
  private readonly logger = new Logger(InitiateTransferService.name);

  constructor(
    @InjectRepository(Transfer)
    private readonly transferRepo: Repository<Transfer>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(data: InitiateTransferDTO) {
    try {
      const userRecord = await this.userRepo.findOne({
        where: { id: data.userId },
      });

      if (!userRecord) {
        throw new ConflictErrorException('Account does not exist');
      }

      const token = generatePasswordResetToken();

      const payload = new InitiateTransferDTO().toEntity(
        data,
        userRecord.email,
        token,
      );

      const result = await this.transferRepo.save(payload);

      const mailData = {
        name: userRecord.firstName,
        email: userRecord.email,
        newEmail: data.newEmail,
        token,
      };

      this.eventEmitter.emit('initiate.transfer', mailData);

      return result;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
