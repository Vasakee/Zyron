import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kit } from '../entity/kit.entity';
import { PractitionerKit } from '../entity/practitioner-kits.entity';
import { UpdateDateOfSampleCollectionDto } from '../dto/update-kit.dto';

interface KitResponse {
  id?: string;
  kitNumber?: string;
  dateOfSampleCollection?: Date;
  updatedAt?: Date;
}

@Injectable()
export class UpdateDateOfSampleCollectionService {
  private readonly logger = new Logger(
    UpdateDateOfSampleCollectionService.name,
  );

  constructor(
    @InjectRepository(Kit) private readonly kitRepo: Repository<Kit>,
    @InjectRepository(PractitionerKit)
    private readonly practitionerKitRepo: Repository<PractitionerKit>,
  ) {}

  async execute(
    kitId: string,
    dto: UpdateDateOfSampleCollectionDto,
  ): Promise<KitResponse> {
    try {
      const [kit, practitionerKit] = await Promise.all([
        this.kitRepo.findOne({ where: { id: kitId } }),
        this.practitionerKitRepo.findOne({ where: { id: kitId } }),
      ]);

      if (!kit && !practitionerKit) {
        throw new NotFoundException('Kit not found');
      }
      if (kit && practitionerKit) {
        throw new ConflictException(
          'Ambiguous kit id exists in multiple tables',
        );
      }

      if (kit) {
        const merged = await this.kitRepo.preload({
          id: kit.id!,
          dateOfSampleCollection:
            dto.dateOfSampleCollection ?? kit.dateOfSampleCollection,
        });
        const saved = await this.kitRepo.save(merged!);
        return this.toResponse(saved);
      } else {
        const merged = await this.practitionerKitRepo.preload({
          id: practitionerKit!.id!,
          dateOfSampleCollection:
            dto.dateOfSampleCollection ??
            practitionerKit!.dateOfSampleCollection,
        });
        const saved = await this.practitionerKitRepo.save(merged!);
        return this.toResponse(saved);
      }
    } catch (error: any) {
      this.logger.error(
        'Failed to update date of sample collection',
        error?.stack ?? error,
      );
      throw error;
    }
  }

  private toResponse(entity: {
    id?: string;
    kitNumber?: string;
    dateOfSampleCollection?: Date;
    updatedAt?: Date;
  }): KitResponse {
    const { id, kitNumber, dateOfSampleCollection, updatedAt } = entity;
    return { id, kitNumber, dateOfSampleCollection, updatedAt };
  }
}
