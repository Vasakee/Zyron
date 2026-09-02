import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SendInfoDto } from '../dto/send-health.info.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PractitionerKit } from 'src/kit/entity/practitioner-kits.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SendHealthInfoService {
  private readonly logger = new Logger(SendHealthInfoService.name);

  constructor(
    @InjectRepository(PractitionerKit)
    private readonly practitionerKitRepo: Repository<PractitionerKit>,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  async execute(data: SendInfoDto) {
    try {
      const practitionerKit = await this.practitionerKitRepo.findOne({
        where: { id: data.kitId },
        relations: ['practitioner', 'practitioner.user'],
      });

      if (!practitionerKit) {
        throw new Error('Practitioner Kit not found');
      }

      const mailData = {
        name:practitionerKit.name,
        practitionerName: practitionerKit.practitioner.user.firstName,
        email: data.email,
        kitId: data.kitId,
      };

      practitionerKit.isSent = true;
      await this.practitionerKitRepo.save(practitionerKit);

      this.eventEmitter.emit('send.health-info.form', mailData);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
