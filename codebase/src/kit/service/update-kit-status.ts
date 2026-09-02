import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kit } from '../entity/kit.entity';
import { ConflictErrorException } from 'src/common';
import { UpdateKitStatusDto } from '../dto/update-kit.dto';
import { KitStatus } from 'src/enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../../user/entity/user.entity';

@Injectable()
export class UpdateKitStatusService {
  private readonly logger = new Logger(UpdateKitStatusService.name);
  constructor(
    @InjectRepository(Kit) private readonly kitRepo: Repository<Kit>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  async execute(kitId: string, data: UpdateKitStatusDto) {
    try {
      const kitRecord = await this.kitRepo.findOne({
        where: { kitNumber: kitId },
      });

      if (!kitRecord) {
        throw new ConflictErrorException('Kit not found');
      }

      const Dto = new UpdateKitStatusDto();

      if (
        data.status === KitStatus.AWAITNG_SAMPLE &&
        kitRecord.status !== KitStatus.REGISTERED
      ) {
        data.status = undefined;
      }

      const payload = Dto.updateEntityI(kitRecord, data);
      if (kitRecord) {
        const userRecord = await this.userRepo.findOne({
          where: { id: kitRecord.userId },
        });
        if (userRecord) {
          const mailData = {
            kitId: kitRecord.kitNumber,
            email: userRecord.email,
            name: userRecord.firstName,
          };

          if (data.status === KitStatus.LAB_PROCESSING) {
            this.eventEmitter.emit('lab.processing', mailData);
          } else if (data.status === KitStatus.SAMPLE_RECIEVED) {
            this.eventEmitter.emit('sample.received', mailData);
          } else if (data.status === KitStatus.RESULT_READY) {
            this.eventEmitter.emit('result.ready', mailData);
          }
        }
      }

      const result = await this.kitRepo.save(payload);

      return Dto.fromEntity(result);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
