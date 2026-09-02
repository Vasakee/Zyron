import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Feedback } from '../entity/feedback.entity';
import { FeedBackQueryDto, CreateFeedbackDto } from '../dto/feedback.dto';
import { PageMetaDto, PageOptionsDto } from 'src/common';
@Injectable()
export class GetAllFeedbackService {
  private readonly logger = new Logger(GetAllFeedbackService.name);

  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepo: Repository<Feedback>,
  ) {}

  async execute(pageOptionsDto: PageOptionsDto, query: FeedBackQueryDto) {
    try {
      const { take, skip } = pageOptionsDto;
      const { searchQuery } = query;
      const sort = 'DESC';

      const dbQuery: SelectQueryBuilder<Feedback> =
        this.feedbackRepo.createQueryBuilder('feedback');

      if (searchQuery) {
        dbQuery.where('feedback.name ILike :searchQuery', {
          searchQuery: `%${searchQuery}%`,
        });
      }

      const [feedbacks, total] = await dbQuery
        .take(take)
        .skip(skip)
        .orderBy('feedback.createdAt', sort)
        .getManyAndCount();

      const pageMetaDto = new PageMetaDto({
        itemCount: total,
        pageOptionsDto,
      });

      const result = feedbacks.map((Feedback) =>
        new CreateFeedbackDto().fromEntity(Feedback),
      );

      return { result, pageMetaDto };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
