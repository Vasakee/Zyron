import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ILike,
  Repository,
  FindManyOptions,
  OrderByCondition,
  FindOptionsWhere,
  FindOptionsOrder,
  Not,
} from 'typeorm';
import { Kit } from '../entity/kit.entity';
import { CreateKitDto, KitQueryDto } from '../dto/create-kit.dto';
import { PageMetaDto, PageOptionsDto } from 'src/common';
import { KitStatus } from 'src/enum';

@Injectable()
export class GetUserKitService {
  private readonly logger = new Logger(GetUserKitService.name);

  constructor(
    @InjectRepository(Kit) private readonly kitRepo: Repository<Kit>,
  ) {}

  async execute(
    userId: string,
    pageOptionsDto: PageOptionsDto,
    query: KitQueryDto,
  ) {
    try {
      const { take, skip } = pageOptionsDto;
      const { searchQuery } = query;

      const where: FindOptionsWhere<Kit> = {
        userId,
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
      };

      const [kits, total] = await Promise.all([
        this.kitRepo.find(dbQuery),
        this.kitRepo.count({ where }),
      ]);

      const pageMetaDto = new PageMetaDto({
        itemCount: total,
        pageOptionsDto,
      });

      const result = kits.map((kit) => new CreateKitDto().fromEntity(kit));

      return { result, pageMetaDto };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
