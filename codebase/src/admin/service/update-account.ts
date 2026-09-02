import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { UpdateAdminAccountDto, UpdateAdminDto } from '../dto/admin.dto';

@Injectable()
export class UpdateAccountService {
  private readonly logger = new Logger(UpdateAccountService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async execute(id: string, data: UpdateAdminAccountDto) {
    try {
      const payload = new UpdateAdminAccountDto().updateEntity(data);
      await this.userRepo.update(id, payload);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
