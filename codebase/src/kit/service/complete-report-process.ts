import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kit } from '../entity/kit.entity';
import { FamilyKit } from '../entity/family-kit.entity';
import { PractitionerKit } from '../entity/practitioner-kits.entity';
import { CompleteReportDto } from '../dto/complete-report.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { KitStatus } from 'src/enum';

@Injectable()
export class CompleteReportProcessService {
  private readonly logger = new Logger(CompleteReportProcessService.name);

  constructor(
    @InjectRepository(Kit) private readonly kitRepo: Repository<Kit>,
    @InjectRepository(FamilyKit)
    private readonly familyKitRepo: Repository<FamilyKit>,
    @InjectRepository(PractitionerKit)
    private readonly practitionerKitRepo: Repository<PractitionerKit>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(kitNumber: string, data: CompleteReportDto) {
    try {
      const Dto = new CompleteReportDto();

      const kitRecord = await this.kitRepo.findOne({
        where: { kitNumber },
        relations: ['user'],
      });

      if (kitRecord) {
        const status = kitRecord.status;
        const mailData = {
          kitId: kitRecord.kitNumber,
          email: kitRecord.user.email,
          name: kitRecord.user.firstName,
        };
        const payload = Dto.updateEntity(kitRecord, data);
        await this.kitRepo.save(payload);
        status !== KitStatus.RESULT_READY &&
          this.eventEmitter.emit('result.ready', mailData);
        return null;
      }

      const familykitRecord = await this.familyKitRepo.findOne({
        where: { kitNumber },
        relations: ['user'],
      });

      if (familykitRecord) {
        const status = familykitRecord.status;
        const payload = Dto.updateFamilyKitEntity(familykitRecord, data);
        await this.familyKitRepo.save(payload);
        const mailData = {
          kitId: familykitRecord.kitNumber,
          email: familykitRecord.user.email,
          name: familykitRecord.name,
        };
        status !== KitStatus.RESULT_READY &&
          this.eventEmitter.emit('result.ready', mailData);
        return null;
      }

      const practitionerKitRecord = await this.practitionerKitRepo.findOne({
        where: { kitNumber },
        relations: ['practitioner', 'practitioner.user'],
      });

      if (practitionerKitRecord) {
        const status = practitionerKitRecord.status;
        const payload = Dto.updatePractitionerEntity(
          practitionerKitRecord,
          data,
        );
        await this.practitionerKitRepo.save(payload);
        const mailData = {
          kitId: practitionerKitRecord.kitNumber,
          email: practitionerKitRecord.practitioner.user.email,
          name: practitionerKitRecord.name,
        };
        status !== KitStatus.RESULT_READY &&
          this.eventEmitter.emit('result.ready', mailData);
        return null;
      }
    } catch (error) {
      this.logger.error('Error executing CompleteReportProcessService', error);
      throw error;
    }
  }
}
