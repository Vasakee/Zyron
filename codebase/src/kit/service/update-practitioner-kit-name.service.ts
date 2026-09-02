import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PractitionerKit } from '../entity/practitioner-kits.entity';
import { UpdatePractitionerKitNameDto } from '../dto/update-kit.dto';

@Injectable()
export class UpdatePractitionerKitNameService {
  private readonly logger = new Logger(UpdatePractitionerKitNameService.name);

  constructor(
    @InjectRepository(PractitionerKit)
    private readonly practitionerKitRepo: Repository<PractitionerKit>,
  ) {}

  async execute(data: UpdatePractitionerKitNameDto) {
    try {
      const kit = await this.practitionerKitRepo.findOne({
        where: { kitNumber: data.kitNumber },
      });

      if (!kit) {
        throw new NotFoundException(
          `Practitioner kit with kit number ${data.kitNumber} not found`,
        );
      }

      // Update the name
      kit.name = data.name;

      const result = await this.practitionerKitRepo.save(kit);

      this.logger.log(
        `Kit ${data.kitNumber} name updated successfully to: ${data.name}`,
      );

      return {
        id: result.id,
        kitNumber: result.kitNumber,
        name: result.name,
        updatedAt: result.updatedAt,
      };
    } catch (error) {
      this.logger.error(
        `Error updating kit name for ${data.kitNumber}:`,
        error,
      );
      throw error;
    }
  }
}
