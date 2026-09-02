import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerProfile } from '../../entity/customer-profile.entity';
import { UpdateCustomerProfileStatusDto } from '../../dto/create-customer-profile.dto';
import { ProfileCreatorRole } from 'src/enum';

@Injectable()
export class CustomerProfilesStatusAdminService {
  constructor(
    @InjectRepository(CustomerProfile)
    private readonly repo: Repository<CustomerProfile>,
  ) {}

  async updateStatus(kitId: string, dto: UpdateCustomerProfileStatusDto) {
    const profile = await this.repo.findOne({ where: { kitId } });
    if (!profile) {
      throw new NotFoundException(
        `Customer profile with kitId ${kitId} not found`,
      );
    }

    profile.lastUpdatedById = dto.userId;
    profile.lastUpdatedByRole = ProfileCreatorRole.ADMIN;
    profile.status = dto.status;
    profile.vaariAnalysisDate = new Date();
    return this.repo.save(profile);
  }
}
