import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { GetUsers } from '../api/requests/get-users';
import { hashPassword } from 'src/common/utils';
import { MigrateUsersDto } from '../dto/migrate-user.dto';
var generator = require('generate-password');

@Injectable()
export class MigrateUsersService {
  private readonly logger = new Logger(MigrateUsersService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async execute() {
    try {
      const oldUsers: MigrateUsersDto[] = await GetUsers();

      const existingUsers = await this.userRepo.find({
        select: ['email'],
      });

      const existingEmails = new Set(existingUsers.map(user => user.email));

      const migrate = oldUsers.map(async (oldUser) => {
        if (!existingEmails.has(oldUser.Email)) {
          const passwordHash = await hashPassword(
            generator.generate({
              length: 10,
              numbers: true,
            }),
          );
          const payload = new MigrateUsersDto().toEntity(oldUser, passwordHash);
          await this.userRepo.save(payload);
        }
      });

      await Promise.all(migrate);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
