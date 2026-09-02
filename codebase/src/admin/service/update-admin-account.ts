import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { Admin } from '../entity/admin.entity';
import { Repository } from 'typeorm';
import { UpdateAdminDto } from '../dto/admin.dto';

@Injectable()
export class UpdateAdminAccountService {
  private readonly logger = new Logger(UpdateAdminAccountService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
  ) {}

  async execute(id: string, data: UpdateAdminDto) {
    try {
      const adminRecord = await this.adminRepo.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!adminRecord || !adminRecord.user) {
        throw new NotFoundException('Admin not found');
      }

      const dto = new UpdateAdminDto();
      const userPayload = dto.toUserEntity(data);

      if (Object.keys(userPayload).length > 0) {
        await this.userRepo.update(adminRecord.userId, userPayload);
      }

      if (data.permissions) {
        const adminPayload = dto.toAdminEntity(data);
        await this.adminRepo.update(adminRecord.id, adminPayload);
      }

      return null;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
