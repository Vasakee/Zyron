import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { AdminPermissions } from 'src/enum';
import { Admin } from 'src/admin/entity/admin.entity';

@Injectable()
export class GetAllUserService {
  private readonly logger = new Logger(GetAllUserService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Admin) private readonly adminRepo: Repository<Admin>,
  ) {}

  async execute() {
    const user = await  this.userRepo.findOne({
      // where: { email: 'vitract.developer@gmail.com' },
      // relations: ["admin"]
    });

    
  //  const admin = await this.adminRepo.save({
  //   userId: user.id,
  //   permissions: [...Object.values(AdminPermissions)]
  //  })

    return user
  }
}
