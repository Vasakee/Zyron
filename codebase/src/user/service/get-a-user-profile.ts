import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { CreateCustomerAccountDto } from '../dto/customer-account.dto';

@Injectable()
export class GetAUserProfileService {
  private readonly logger = new Logger(GetAUserProfileService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async execute(id: string) {
    try {
      const user = await this.userRepo.findOne({
        where: { id },
      });

      return new CreateCustomerAccountDto().fromEntity(user);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
