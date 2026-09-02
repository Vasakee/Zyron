import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ILike,
  Repository,
  FindManyOptions,
  FindOptionsWhere,
  FindOptionsOrder,
  Not,
} from 'typeorm';
import { KitQueryDto } from '../dto/create-kit.dto';
import { PageMetaDto, PageOptionsDto } from 'src/common';
import { KitStatus } from 'src/enum';
import { FetchKitsDto } from '../dto/fetch-kit.dto';
import { PractitionerKit } from '../entity/practitioner-kits.entity';
import { Practitioner } from 'src/practitioner/entity/practitioner.entity';
import { Kit } from 'src/kit/entity/kit.entity';

@Injectable()
export class GetOldPractitionerKitService {
  private readonly logger = new Logger(GetOldPractitionerKitService.name);

  constructor(
    @InjectRepository(PractitionerKit)
    private readonly practitionerKitRepo: Repository<PractitionerKit>,
    @InjectRepository(Practitioner)
    private readonly practitionerRepo: Repository<Practitioner>,
    @InjectRepository(Kit)
    private readonly kitRepo: Repository<Kit>,
  ) {}

  async execute(
    userId: string,         
    pageOptionsDto: PageOptionsDto,
    query: KitQueryDto,
  ) {
    try {
      const { take, skip } = pageOptionsDto;
      const { searchQuery } = query;

      const practitioner = await this.practitionerRepo.findOne({
        where: { userId },
        select: ['id'],
      });

      console.log(practitioner)
      const wherePractitionerKit: FindOptionsWhere<PractitionerKit> = {
        practitionerId: practitioner.id,
        // status: Not(KitStatus.REGISTERED),
      };
      if (searchQuery) {
        wherePractitionerKit.kitNumber = ILike(`%${searchQuery}%`);
      }

      const orderPractitionerKit: FindOptionsOrder<PractitionerKit> = { createdAt: 'DESC' };

      const practitionerKits = await this.practitionerKitRepo.find({
        where: wherePractitionerKit,
        order: orderPractitionerKit,
      });

      const whereKit: FindOptionsWhere<Kit> = { userId };
      if (searchQuery) {
        whereKit.kitNumber = ILike(`%${searchQuery}%`);
      }

      const kits = await this.kitRepo.find({
        where: whereKit,
        order: { createdAt: 'DESC' },
        relations: ["user"]
      });

      const combinedResults = [...practitionerKits, ...kits].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );

      const paginatedResults = combinedResults.slice(skip, skip + take);
      const total = combinedResults.length;

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
