import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerProfile } from '../entity/customer-profile.entity';
import { FetchCustomerProfilesDto } from '../dto/fetch-customer-profiles.dto';

@Injectable()
export class GetCustomerProfileService {
  private readonly logger = new Logger(GetCustomerProfileService.name);

  constructor(
    @InjectRepository(CustomerProfile)
    private readonly repo: Repository<CustomerProfile>,
  ) {}

  async execute(id: string): Promise<FetchCustomerProfilesDto> {
    try {
      const profile = await this.repo.findOne({ where: { id } });
      if (!profile) {
        throw new NotFoundException(`Customer profile with ID ${id} not found`);
      }
      return new FetchCustomerProfilesDto().fromEntity(profile);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
