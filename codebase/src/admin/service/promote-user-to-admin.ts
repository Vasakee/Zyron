import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictErrorException } from 'src/common';
import { AccountRoles } from 'src/enum';
import { User } from 'src/user/entity/user.entity';
import { Admin } from '../entity/admin.entity';
import { CreateAdminDto, PromoteUserToAdminDto } from '../dto/admin.dto';

@Injectable()
export class PromoteUserToAdminService {
  private readonly logger = new Logger(PromoteUserToAdminService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
  ) {}

  async execute(data: PromoteUserToAdminDto) {
    try {
      const user = await this.userRepo.findOne({
        where: { id: data.userId },
        relations: ['admin'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.role === AccountRoles.SUPER_ADMIN) {
        throw new ConflictErrorException('User is already a super admin');
      }

      const adminPayload = user.admin ?? new Admin();
      adminPayload.permissions = data.permissions;
      adminPayload.userId = user.id;

      if (user.role !== AccountRoles.ADMIN) {
        user.role = AccountRoles.ADMIN;
      }

      user.admin = await this.adminRepo.save(adminPayload);

      const result = await this.userRepo.save(user);
      return new CreateAdminDto().fromEntity(result);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
