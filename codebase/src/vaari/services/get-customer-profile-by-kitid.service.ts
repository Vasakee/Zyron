import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerProfile } from '../entity/customer-profile.entity';
import { FetchCustomerProfilesDto } from '../dto/fetch-customer-profiles.dto';

@Injectable()
export class GetCustomerProfileByKitIdService {
  private readonly logger = new Logger(GetCustomerProfileByKitIdService.name);

  constructor(
    @InjectRepository(CustomerProfile)
    private readonly repo: Repository<CustomerProfile>,
  ) {}

  async execute(
    kitId: string,
    userId: string,
  ): Promise<FetchCustomerProfilesDto> {
    try {
      const profile = await this.repo.findOne({ where: { kitId, userId } });
      if (!profile) {
        return null;
      }
      return new FetchCustomerProfilesDto().fromEntity(profile);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
