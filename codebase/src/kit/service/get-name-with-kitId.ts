import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kit } from '../entity/kit.entity';
import { FamilyKit } from '../entity/family-kit.entity';
import { PractitionerKit } from '../entity/practitioner-kits.entity';
import { NotFoundErrorException } from 'src/common';
import { capitalizeString } from 'src/common/utils';

@Injectable()
export class GetNameWithKitIDService {
  private readonly logger = new Logger(GetNameWithKitIDService.name);

  constructor(
    @InjectRepository(Kit) private readonly kitRepo: Repository<Kit>,
    @InjectRepository(FamilyKit)
    private readonly familyKitRepo: Repository<FamilyKit>,
    @InjectRepository(PractitionerKit)
    private readonly practitionerKitRepo: Repository<PractitionerKit>,
  ) {}

  async execute(kitNumber: string) {
    try {
      // Check the Kit repository first
      const kit = await this.kitRepo.findOne({
        where: { kitNumber },
        select: ['id', 'user'],
        relations: ['user'],
      });

      if (kit) {
        if (!kit.user) {
          throw new NotFoundErrorException(
            'Could not find a user account for this kit',
          );
        }
        return `${capitalizeString(kit.user.firstName)} ${capitalizeString(
          kit.user.lastName,
        )}`;
      }

      // If not found in Kit repository, check the FamilyKit repository
      const familyKit = await this.familyKitRepo.findOne({
        where: { kitNumber },
        select: ['id', 'name'],
      });

      if (familyKit) {
        if (!familyKit.name) {
          throw new NotFoundErrorException(
            'Could not find a name for this family kit',
          );
        }
        return `${capitalizeString(familyKit.name)}`;
      }

      // If not found in FamilyKit repository, check the PractitionerKit repository
      const practitionerKit = await this.practitionerKitRepo.findOne({
        where: { kitNumber },
        select: ['id', 'name'],
      });

      if (practitionerKit) {
        if (!practitionerKit.name) {
          throw new NotFoundErrorException(
            'Could not find a name for this practitioner kit',
          );
        }
        return `${capitalizeString(practitionerKit.name)}`;
      }

      // If none of the repositories have the kit, throw an error
      throw new NotFoundErrorException('Kit not found in any repository');
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
