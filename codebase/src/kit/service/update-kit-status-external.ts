import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kit } from '../entity/kit.entity';
import { PractitionerKit } from '../entity/practitioner-kits.entity';
import { User } from '../../user/entity/user.entity';
import { NotFoundErrorException } from 'src/common';
import { UpdateKitStatusDto } from '../dto/update-kit.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { KitStatus } from 'src/enum';

@Injectable()
export class UpdateKitStatusExternalService {
  private readonly logger = new Logger(UpdateKitStatusExternalService.name);

  constructor(
    @InjectRepository(Kit) private readonly kitRepo: Repository<Kit>,
    @InjectRepository(PractitionerKit)
    private readonly practitionerKitRepo: Repository<PractitionerKit>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(kitId: string, data: UpdateKitStatusDto) {
    try {
      const dto = new UpdateKitStatusDto();

      // Try customer kit first
      const kitRecord = await this.kitRepo.findOne({
        where: { kitNumber: kitId },
      });

      if (kitRecord) {
        // Customer Kit
        const payload = dto.updateEntityI(kitRecord, data);
        const result = await this.kitRepo.save(payload);

        const userRecord = await this.userRepo.findOne({
          where: { id: kitRecord.userId },
        });

        if (userRecord) {
          this.emitStatusEvent(data.status, {
            kitId: kitRecord.kitNumber,
            email: userRecord.email,
            name: userRecord.firstName,
          });
        }

        return dto.fromEntity(result);
      }

      // Try practitioner kit
      const practitionerKitRecord = await this.practitionerKitRepo.findOne({
        where: { kitNumber: kitId },
        relations: ['practitioner', 'practitioner.user'],
      });

      if (practitionerKitRecord) {
        const payload = dto.updatePractitionerEntity(
          practitionerKitRecord,
          data,
        );
        const result = await this.practitionerKitRepo.save(payload);

        const mailData = {
          kitId: practitionerKitRecord.kitNumber,
          email: practitionerKitRecord.practitioner.user.email,
          name: practitionerKitRecord.practitioner.user.firstName,
        };

        this.emitStatusEvent(data.status, mailData);

        if (data.isClient) {
          this.eventEmitter.emit('heath.info.completed', {
            name: mailData.name,
            email: mailData.email,
            clientName: practitionerKitRecord.name,
          });
        }

        return dto.fromPractitionerEntity(result);
      }

      throw new NotFoundErrorException('Kit not found in either table');
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  private emitStatusEvent(status: string, mailData: any) {
    switch (status) {
      case KitStatus.LAB_PROCESSING:
        this.eventEmitter.emit('lab.processing', mailData);
        break;
      case KitStatus.SAMPLE_RECIEVED:
        this.eventEmitter.emit('sample.received', mailData);
        break;
      case KitStatus.RESULT_READY:
        this.eventEmitter.emit('result.ready', mailData);
        break;
    }
  }
}
