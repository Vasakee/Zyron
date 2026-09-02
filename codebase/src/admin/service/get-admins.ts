import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import { AdminQueryDto, CreateAdminDto } from '../dto/admin.dto';
import { AccountRoles, AccountStatus } from 'src/enum';
import { PageMetaDto, PageOptionsDto } from 'src/common';

@Injectable()
export class GetAdminsService {
  private readonly logger = new Logger(GetAdminsService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async execute(pageOptionsDto: PageOptionsDto, query: AdminQueryDto) {
    try {
      const { take, skip } = pageOptionsDto;
      const { searchQuery } = query;
      const sort = 'DESC';

      const dbQuery: SelectQueryBuilder<User> = this.userRepo
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.admin', 'admin')
        .where('user.role IN (:...roles)', {
          roles: [AccountRoles.SUPER_ADMIN, AccountRoles.ADMIN],
        })
        .andWhere('user.status = :status', {
          status: AccountStatus.ACTIVE,
        });

      if (searchQuery) {
        dbQuery.andWhere(
          new Brackets((qb) => {
            qb.where('user.firstName LIKE :searchQuery', {
              searchQuery: `%${searchQuery}%`,
            })
              .orWhere('user.lastName LIKE :searchQuery', {
                searchQuery: `%${searchQuery}%`,
              })
              .orWhere('user.email LIKE :searchQuery', {
                searchQuery: `%${searchQuery}%`,
              });
          }),
        );
      }

      const response = await dbQuery
        .take(take)
        .skip(skip)
        .orderBy('user.createdAt', sort)
        .getManyAndCount();

      console.log(response);

      const [result, total] = response;

      const pageMetaDto = new PageMetaDto({
        itemCount: total,
        pageOptionsDto,
      });

      const admins = result.map((admin) =>
        new CreateAdminDto().fromEntity(admin),
      );

      return { admins, pageMetaDto };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
