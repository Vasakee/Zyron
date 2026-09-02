import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { Tutorials } from '../entity/tutorial.entity';
import {
  UploadTutorialDto,
  TutorialsQueryDto,
} from '../dto/upload-tutorial.dto';
import { PageMetaDto, PageOptionsDto } from 'src/common';
import { ResourceTypes } from 'src/enum';

@Injectable()
export class GetAllTutorialService {
  private readonly logger = new Logger(GetAllTutorialService.name);

  constructor(
    @InjectRepository(Tutorials)
    private readonly tutorialRepo: Repository<Tutorials>,
  ) {}

  async execute(pageOptionsDto: PageOptionsDto, query: TutorialsQueryDto) {
    try {
      const { take, skip } = pageOptionsDto;
      const { searchQuery, resourceType, category } = query;

      const dbQuery: SelectQueryBuilder<Tutorials> =
        this.tutorialRepo.createQueryBuilder('tutorial');

      if (resourceType === ResourceTypes.DOCUMENT) {
        dbQuery.where(
          '(tutorial.resourceType = :pdf OR tutorial.resourceType = :ppt)',
          {
            pdf: ResourceTypes.PDF,
            ppt: ResourceTypes.PPT,
          },
        );
      } else {
        dbQuery.where('tutorial.resourceType = :resourceType', {
          resourceType,
        });
      }

      if (category) {
        dbQuery.andWhere('tutorial.category = :category', { category });
      }

      if (searchQuery) {
        dbQuery.andWhere('tutorial.title ILike :searchQuery', {
          searchQuery: `%${searchQuery}%`,
        });
      }

      const [tutorials, total] = await dbQuery
        .take(take)
        .skip(skip)
        .getManyAndCount();

      const pageMetaDto = new PageMetaDto({
        itemCount: total,
        pageOptionsDto,
      });

      const result = tutorials.map((tutorial) =>
        new UploadTutorialDto().fromEntity(tutorial),
      );

      return { result, pageMetaDto };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
