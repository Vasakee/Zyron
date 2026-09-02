import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  In,
  Not,
  Repository,
} from 'typeorm';
import { Kit } from '../entity/kit.entity';
import { CreateKitDto, KitQueryDto } from '../dto/create-kit.dto';
import { PageMetaDto, PageOptionsDto } from 'src/common';
import { Practitioner } from 'src/practitioner/entity/practitioner.entity';
import { KitStatus, PractitionerAccessStatus } from 'src/enum';

@Injectable()
export class GetPractitionerKitService {
  private readonly logger = new Logger(GetPractitionerKitService.name);

  constructor(
    @InjectRepository(Kit) private readonly kitRepo: Repository<Kit>,
    @InjectRepository(Practitioner)
    private readonly practitionerRepo: Repository<Practitioner>,
  ) {}

  async execute(
    userId: string,
    pageOptionsDto: PageOptionsDto,
    query: KitQueryDto,
  ) {
    try {
      const practitioner = await this.practitionerRepo.findOne({
        where: { userId },
        select: ['id'],
      });

      const practitionerId = practitioner?.id;
      const { take, skip } = pageOptionsDto;
      const { searchQuery } = query;

      const where: FindOptionsWhere<Kit> = {
        user: {
          clientPractitioners: {
            practitionerId,
            reportAccess: PractitionerAccessStatus.GRANTED,
          },
        },
        // status: Not(KitStatus.REGISTERED),
      };
      if (searchQuery) {
        where.kitNumber = ILike(`%${searchQuery}%`);
      }

      const order: FindOptionsOrder<Kit> = { createdAt: 'DESC' };

      const dbQuery: FindManyOptions<Kit> = {
        where,
        skip,
        take,
        order,
        relations: ['user', 'user.practitioner'],
      };

      const [kits, total] = await Promise.all([
        this.kitRepo.find(dbQuery),
        this.kitRepo.count({ where }),
      ]);

      const pageMetaDto = new PageMetaDto({
        itemCount: total,
        pageOptionsDto,
      });

      const result = kits.map((kit) =>
        new CreateKitDto().fromPractitoinerEntity(kit),
      );

      return { result, pageMetaDto };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
