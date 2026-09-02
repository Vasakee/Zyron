import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SelectQueryBuilder, Repository } from 'typeorm';
import { Kit } from '../entity/kit.entity';
import { CreateKitDto, KitQueryDto } from '../dto/create-kit.dto';
import { PageMetaDto, PageOptionsDto } from 'src/common';
import { TypesOfKits } from 'src/enum';
import { PractitionerKit } from '../entity/practitioner-kits.entity';
import { FamilyKit } from '../entity/family-kit.entity';
import { FetchKitsDto } from '../dto/fetch-kit.dto';

@Injectable()
export class GetAllKitService {
  private readonly logger = new Logger(GetAllKitService.name);

  constructor(
    @InjectRepository(Kit) private readonly kitRepo: Repository<Kit>,
    @InjectRepository(PractitionerKit)
    private readonly practitionerKitRepo: Repository<PractitionerKit>,
    @InjectRepository(FamilyKit)
    private readonly familyKitRepo: Repository<FamilyKit>,
  ) {}

  async execute(pageOptionsDto: PageOptionsDto, query: KitQueryDto) {
    try {
      const { take, skip } = pageOptionsDto;
      const { searchQuery, type, practitionerId } = query;
      const sort = 'DESC';

      let dbQuery: SelectQueryBuilder<any>;
      let kitsQuery: SelectQueryBuilder<any>;
      let repo: Repository<any>;
      let alias: string;

      switch (type) {
        case TypesOfKits.FAMILY:
          repo = this.familyKitRepo;
          alias = 'family-kits';
          break;

        case TypesOfKits.PRACTITIONER:
          repo = this.practitionerKitRepo;
          alias = 'practitioner-kits';
          break;

        case TypesOfKits.CLIENTS:
          repo = this.kitRepo;
          alias = 'kit';
          break;

        default:
          this.logger.error('Invalid kit type');
          throw new Error('Invalid kit type');
      }

      dbQuery = repo.createQueryBuilder(alias);

      if (type === TypesOfKits.FAMILY || type === TypesOfKits.CLIENTS) {
        dbQuery.leftJoinAndSelect(`${alias}.user`, 'user');
      } else if (type === TypesOfKits.PRACTITIONER) {
        dbQuery
          .leftJoinAndSelect(`${alias}.practitioner`, 'practitioner')
          .leftJoinAndSelect('practitioner.user', 'user');
      }

      if (searchQuery) {
        dbQuery.andWhere(
          `(${alias}.kitNumber LIKE :searchQuery OR user.lastName LIKE :searchQuery OR user.firstName LIKE :searchQuery OR user.lastName LIKE :searchQuery)`,
          { searchQuery: `%${searchQuery}%` },
        );
      }

      if (
        (type === TypesOfKits.PRACTITIONER || type === TypesOfKits.FAMILY) &&
        searchQuery
      ) {
        dbQuery.andWhere(
          `(${alias}.kitNumber LIKE :searchQuery OR ${alias}.name LIKE :searchQuery OR user.firstName LIKE :searchQuery OR user.lastName LIKE :searchQuery)`,
          { searchQuery: `%${searchQuery}%` },
        );
      }

      if (type === TypesOfKits.PRACTITIONER && practitionerId) {
        dbQuery.andWhere(`${alias}.practitionerId = :practitionerId`, {
          practitionerId,
        });
      }

      kitsQuery = dbQuery
        .orderBy(`${alias}.dateOfSampleCollection`, sort)
        .take(take)
        .skip(skip);

      const [kits, total] = await Promise.all([
        kitsQuery.getMany(),
        dbQuery.getCount(),
      ]);

      const pageMetaDto = new PageMetaDto({
        itemCount: total,
        pageOptionsDto,
      });
      const result = kits.map((kit) => {
        if (type === TypesOfKits.PRACTITIONER) {
          return new FetchKitsDto().fromPractitionerEntity(kit);
        } else if (type === TypesOfKits.FAMILY) {
          return new FetchKitsDto().fromFamilyEntity(kit);
        } else {
          return new CreateKitDto().fromEntity(kit);
        }
      });

      return { result, pageMetaDto };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
