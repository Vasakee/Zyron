import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictErrorException, NotFoundErrorException } from 'src/common';
import { UpdateKitStatusDto } from '../dto/update-kit.dto';
import { KitStatus } from 'src/enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PractitionerKit } from '../entity/practitioner-kits.entity';

@Injectable()
export class UpdatePractitionerKitStatusService {
  private readonly logger = new Logger(UpdatePractitionerKitStatusService.name);
  constructor(
    @InjectRepository(PractitionerKit)
    private readonly practitionerKitRepo: Repository<PractitionerKit>,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  async execute(kitId: string, data: UpdateKitStatusDto) {
    try {
      const kitRecord = await this.practitionerKitRepo.findOne({
        where: { kitNumber: kitId },
        relations: ['practitioner', 'practitioner.user'],
      });

      if (!kitRecord) {
        throw new NotFoundErrorException('Kit not found');
      }

      const Dto = new UpdateKitStatusDto();

      if (
        data.status === KitStatus.AWAITNG_SAMPLE &&
        kitRecord.status !== KitStatus.REGISTERED
      ) {
        data.status = undefined;
      }

      const payload = Dto.updatePractitionerEntity(kitRecord, data);

      const result = await this.practitionerKitRepo.save(payload);

      const mailData = {
        kitId: kitRecord.kitNumber,
        email: kitRecord.practitioner.user.email,
        name: kitRecord.practitioner.user.firstName,
      };

      if (data.status === KitStatus.LAB_PROCESSING) {
        this.eventEmitter.emit('lab.processing', mailData);
      } else if (data.status === KitStatus.SAMPLE_RECIEVED) {
        this.eventEmitter.emit('sample.received', mailData);
      } else if (data.status === KitStatus.RESULT_READY) {
        this.eventEmitter.emit('result.ready', mailData);
      }

      const clientMailData = {
        name: kitRecord.practitioner.user.firstName,
        email: kitRecord.practitioner.user.email,
        clientName: kitRecord.name,
      };

      if (data.isClient) {
        this.eventEmitter.emit('heath.info.completed', clientMailData);
      }

      return Dto.fromPractitionerEntity(result);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
