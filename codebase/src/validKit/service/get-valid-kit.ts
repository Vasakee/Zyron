import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  Not,
  Repository,
} from 'typeorm';
import { ValidKit } from '../entity/valid-kit.entity';
import { PageOptionsDto, PageMetaDto } from 'src/common';
import { KitStatus } from 'src/enum';
import { CreateValidKitDto } from '../dto/create-kit.dto';

@Injectable()
export class GetAllValidKitService {
  private readonly logger = new Logger(GetAllValidKitService.name);

  constructor(
    @InjectRepository(ValidKit)
    private readonly validKitRepo: Repository<ValidKit>,
  ) {}

  async execute(pageOptionsDto: PageOptionsDto) {
    try {
      const { take, skip } = pageOptionsDto;

      const where: FindOptionsWhere<ValidKit> = {
        status: KitStatus.ISSUED,
      };

      const dbQuery: FindManyOptions<ValidKit> = {
        where,
        skip,
        take,
      };

      const [validKits, total] = await Promise.all([
        this.validKitRepo.find(dbQuery),
        this.validKitRepo.count({ where }),
      ]);
      const pageMetaDto = new PageMetaDto({
        itemCount: total,
        pageOptionsDto,
      });

      // const result = validKits.map((validKit) =>
      //   new CreateValidKitDto().fromEntity(validKit),
      // );
      const result = validKits.map((validKit) => {
        const kitDto = new CreateValidKitDto().fromEntity(validKit);
        this.logger.debug(`Mapped valid kit: ${JSON.stringify(kitDto)}`);
        return kitDto;
      });
      return { result, pageMetaDto };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
