import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kit } from 'src/kit/entity/kit.entity';
import { PractitionerKit } from 'src/kit/entity/practitioner-kits.entity';
import { KitStatus } from 'src/enum';

@Injectable()
export class CheckKitValidityService {
  private readonly logger = new Logger(CheckKitValidityService.name);

  constructor(
    @InjectRepository(Kit)
    private readonly kitRepo: Repository<Kit>,
    @InjectRepository(PractitionerKit)
    private readonly practitionerKitRepo: Repository<PractitionerKit>,
  ) {}

  async execute(kitId: string, userId: string) {
    try {
      const kit = await this.kitRepo.findOne({
        where: {
          kitNumber: kitId,
          user: {
            clientPractitioners: { practitioner: { user: { id: userId } } },
          },
        },
        relations: ['user'],
      });

      if (kit) {
        this.checkKitValidity(kit, userId);
        
        return {
          kitNumber: kit.kitNumber,
          name: `${kit.user.firstName} ${kit.user.lastName}`,
          status: kit.status,
          type: kit.kitType,
          resultsAvailable: kit.resultsAvailable,
          owner: {
            id: kit.user.id,
            email: kit.user.email,
          },
          source: 'Kit',
        };
      }

      const practitionerKit = await this.practitionerKitRepo.findOne({
        where: {
          kitNumber: kitId,
          practitioner: { user: { id: userId } },
        },
        relations: ['practitioner'],
      });

      if (practitionerKit) {
        this.checkKitValidity(practitionerKit, userId);

        return {
          kitNumber: practitionerKit.kitNumber,
          name: practitionerKit.name,
          status: practitionerKit.status,
          type: practitionerKit.kitType,
          resultsAvailable: practitionerKit.resultsAvailable,
          practitioner: {
            id: practitionerKit.practitioner.id,
            name: practitionerKit.practitioner.practiceName,
          },
          source: 'PractitionerKit',
        };
      }

      throw new NotFoundException(
        `No kit found with ID "${kitId}" for this practitioner`,
      );
    } catch (error) {
      this.logger.error(`Error fetching kit ${kitId}`, error.stack);
      throw error;
    }
  }

  private checkKitValidity(kit: Kit | PractitionerKit, userId: string) {
    if (
      (kit.status !== KitStatus.RESULT_READY &&
        (!kit.pdfUrl || kit.pdfUrl === '')) ||
      !kit.resultsAvailable
    ) {
      this.logger.warn(`The microbiome report for this kit is not ready`, {
        userId,
        kitStatus: kit.status,
        pdfUrl: kit.pdfUrl,
        resultsAvailable: kit.resultsAvailable,
      });
      throw new NotFoundException(
        `The microbiome report for this kit is not ready`,
      );
    }
  }
}
