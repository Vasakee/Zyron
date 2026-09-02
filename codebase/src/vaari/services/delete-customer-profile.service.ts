import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CustomerProfile } from '../entity/customer-profile.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DeleteCustomerProfileService {
  constructor(
    @InjectRepository(CustomerProfile)
    private readonly repo: Repository<CustomerProfile>,
  ) {}

  async execute(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
