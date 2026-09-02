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
import { FamilyKit } from '../entity/family-kit.entity';
import { FetchKitsDto } from '../dto/fetch-kit.dto';

@Injectable()
export class GetFamilyKitService {
  private readonly logger = new Logger(GetFamilyKitService.name);

  constructor(
    @InjectRepository(FamilyKit)
    private readonly familyKitRepo: Repository<FamilyKit>,
  ) {}

  async execute(
    userId: string,
    pageOptionsDto: PageOptionsDto,
    query: KitQueryDto,
  ) {
    try {
      const { take, skip } = pageOptionsDto;
      const { searchQuery } = query;

      const where: FindOptionsWhere<FamilyKit> = {
        userId,
        status: Not(KitStatus.REGISTERED),
      };
      if (searchQuery) {
        where.kitNumber = ILike(`%${searchQuery}%`);
      }

      const order: FindOptionsOrder<FamilyKit> = { createdAt: 'DESC' };

      const dbQuery: FindManyOptions<FamilyKit> = {
        where,
        skip,
        take,
        order,
      };

      const [kits, total] = await Promise.all([
        this.familyKitRepo.find(dbQuery),
        this.familyKitRepo.count({ where }),
      ]);

      const pageMetaDto = new PageMetaDto({
        itemCount: total,
        pageOptionsDto,
      });

      const result = kits.map((kit) => new FetchKitsDto().fromFamilyEntity(kit));

      return { result, pageMetaDto };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
