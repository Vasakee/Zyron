import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kit } from '../entity/kit.entity';
import { PractitionerKit } from '../entity/practitioner-kits.entity';
import { RegisterPractitionerKitDto } from '../dto/register-practitioner-kit.dto';

@Injectable()
export class GetSingleKitService {
  private readonly logger = new Logger(GetSingleKitService.name);

  constructor(
    @InjectRepository(PractitionerKit)
    private readonly practitionerKitRepo: Repository<PractitionerKit>,
  ) {}

  async execute(id: string) {
    try {
      const kit = await this.practitionerKitRepo.findOne({
        where: { id },
      });

      return new RegisterPractitionerKitDto().fromEntity(kit);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
