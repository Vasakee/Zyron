// server/src/vaari/customer-profiles/service/create-customer-profile.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerProfile } from '../entity/customer-profile.entity';
import { CreateCustomerProfileDto } from '../dto/create-customer-profile.dto';
import { FetchCustomerProfilesDto } from '../dto/fetch-customer-profiles.dto';
import { CheckKitValidityService } from './check-kit-validity.service';

@Injectable()
export class CreateCustomerProfileService {
  private readonly logger = new Logger(CreateCustomerProfileService.name);

  constructor(
    @InjectRepository(CustomerProfile)
    private readonly repo: Repository<CustomerProfile>,
    private readonly checkKitValidityService: CheckKitValidityService,
  ) {}

  async execute(
    dto: CreateCustomerProfileDto,
  ): Promise<FetchCustomerProfilesDto> {
    try {
      const data = await this.checkKitValidityService.execute(
        dto.kitId,
        dto.userId,
      );

      const values: Partial<CustomerProfile> = {
        ...dto,
        reportReleaseDate: data.resultsAvailable,
      };

      await this.repo.upsert(values as CustomerProfile, ['kitId']);

      const saved = await this.repo.findOneOrFail({
        where: { kitId: dto.kitId },
      });
      return new FetchCustomerProfilesDto().fromEntity(saved);
    } catch (error: any) {
      if (error?.number === 2627 || /UQ_/i.test(error?.message ?? '')) {
        const existing = await this.repo.findOneOrFail({
          where: { kitId: dto.kitId },
        });
        return new FetchCustomerProfilesDto().fromEntity(existing);
      }
      this.logger.error(error);
      throw error;
    }
  }
}
