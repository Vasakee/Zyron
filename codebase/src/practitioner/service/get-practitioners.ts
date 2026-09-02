import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { Practitioner } from '../entity/practitioner.entity';
import { PageMetaDto, PageOptionsDto } from 'src/common';
import {
  CreatePractitionerAccountDto,
  PractitionerQueryDto,
} from '../dto/create-practitioner-dto';
import { AccountStatus } from 'src/enum';

@Injectable()
export class GetAllPractitionerProfileService {
  private readonly logger = new Logger(GetAllPractitionerProfileService.name);

  constructor(
    @InjectRepository(Practitioner)
    private readonly practitionerRepo: Repository<Practitioner>,
  ) {}

  async execute(pageOptionsDto: PageOptionsDto, query: PractitionerQueryDto) {
    try {
      const { take, skip } = pageOptionsDto;
      const { searchQuery } = query;
      const sort = 'DESC';

      const dbQuery: SelectQueryBuilder<Practitioner> = this.practitionerRepo
        .createQueryBuilder('practitioner')
        .leftJoinAndSelect('practitioner.user', 'user')
        .where('user.status = :status', {
          status: AccountStatus.ACTIVE,
        });

      if (searchQuery) {
        dbQuery.andWhere(
          new Brackets((qb) => {
            qb.where('practitioner.practiceName LIKE :searchQuery', {
              searchQuery: `%${searchQuery}%`,
            })
              .orWhere('user.firstName LIKE :searchQuery', {
                searchQuery: `%${searchQuery}%`,
              })
              .orWhere('user.lastName LIKE :searchQuery', {
                searchQuery: `%${searchQuery}%`,
              });
          }),
        );
      }

      const response = await dbQuery
        .take(take)
        .skip(skip)
        .orderBy('practitioner.createdAt', sort)
        .getManyAndCount();

      const [result, total] = response;

      const pageMetaDto = new PageMetaDto({
        itemCount: total,
        pageOptionsDto,
      });

      const practitioners = result.map((practitioner) =>
        new CreatePractitionerAccountDto().fromPractitionerEntity(practitioner),
      );

      return { practitioners, pageMetaDto };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
