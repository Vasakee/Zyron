import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  SelectQueryBuilder,
  Like,
  FindOptionsWhere,
  FindOptionsOrder,
} from 'typeorm';
import { KitQueryDto } from '../dto/create-kit.dto';
import { PageMetaDto, PageOptionsDto } from 'src/common';
import { Kit } from 'src/kit/entity/kit.entity';
import { ClientPractitioner } from 'src/practitioner/entity/client-practitioner.entity';
import { User } from 'src/user/entity/user.entity';
import { FetchKitsDto } from '../dto/fetch-kit.dto';
import { PractitionerKit } from '../entity/practitioner-kits.entity';
import { Practitioner } from 'src/practitioner/entity/practitioner.entity';

@Injectable()
export class GetAllPractitionerKitService {
  private readonly logger = new Logger(GetAllPractitionerKitService.name);

  constructor(
    @InjectRepository(Kit)
    private readonly kitRepo: Repository<Kit>,
    @InjectRepository(ClientPractitioner)
    private readonly clientPractitionerRepo: Repository<ClientPractitioner>,
    @InjectRepository(PractitionerKit)
    private readonly practitionerKitRepo: Repository<PractitionerKit>,
    @InjectRepository(Practitioner)
    private readonly practitionerRepo: Repository<Practitioner>,
  ) {}

  async execute(
    practitionerId: string,
    pageOptionsDto: PageOptionsDto,
    query: KitQueryDto,
  ) {
    try {
      const { take, skip } = pageOptionsDto;
      const { searchQuery } = query;

      const practitioner = await this.practitionerRepo.findOne({
        where: { id: practitionerId },
      });

      if (!practitioner) {
        throw new Error('Practitioner not found');
      }

      const qb: SelectQueryBuilder<ClientPractitioner> =
        this.clientPractitionerRepo.createQueryBuilder('client_practitioner');

      qb.innerJoinAndSelect('client_practitioner.user', 'client')
        .innerJoinAndSelect('client.kit', 'kit')
        .innerJoinAndSelect('kit.user', 'user')
        .where('client_practitioner.practitionerId = :practitionerId', {
          practitionerId,
        });

      if (searchQuery) {
        qb.andWhere(
          '(kit.kitNumber Like :searchQuery OR user.lastName LIKE :searchQuery OR user.firstName LIKE :searchQuery )',
          {
            searchQuery: `%${searchQuery}%`,
          },
        );
      }

      qb.orderBy('kit.createdAt', 'DESC');

      const [clientPractitioners, clientPractitionerTotal] =
        await qb.getManyAndCount();

      const db: SelectQueryBuilder<PractitionerKit> =
        this.practitionerKitRepo.createQueryBuilder('practitioner-kits');
      db.where('practitioner-kits.practitionerId = :practitionerId', {
        practitionerId,
      });
      if (searchQuery) {
        db.andWhere(
          'practitioner-kits.kitNumber Like :searchQuery OR name LIKE :searchQuery ',
          {
            searchQuery: `%${searchQuery}%`,
          },
        );
      }
      db.orderBy('practitioner-kits.createdAt', 'DESC');
      const [practitionerskit, practitionerKitTotal] =
        await db.getManyAndCount();

      const combinedResults = [
        ...practitionerskit,
        ...clientPractitioners.flatMap((cp) => cp.user.kit),
      ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const paginatedResults = combinedResults.slice(skip, skip + take);
     
      const total = practitionerKitTotal + clientPractitionerTotal;

      const pageMetaDto = new PageMetaDto({
        itemCount: total,
        pageOptionsDto,
      });

      const result = paginatedResults.map((item) => {
        if (item instanceof PractitionerKit) {
          return new FetchKitsDto().fromPractitionerEntity(item);
        } else if (item instanceof Kit) {
          return new FetchKitsDto().fromKitEntity(item, practitioner);
        }
      });

      return { result, pageMetaDto };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
