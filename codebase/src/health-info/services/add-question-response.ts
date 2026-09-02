import { Injectable, Logger } from '@nestjs/common';
import { QuestionnaireResponseCacheService } from 'src/database/cache/response';
import { addQuestionResponseDto } from '../dto/question-resonse.dto';

@Injectable()
export class AddQuestionResponseService {
  private readonly logger = new Logger(AddQuestionResponseService.name);

  constructor(
    private readonly questionnaireResponseCacheService: QuestionnaireResponseCacheService,
  ) {}

  async addResponse(data: addQuestionResponseDto) {
    const { kitId, categoryId, questionResponse, completed } = data;
    await this.questionnaireResponseCacheService.addQuestionResponse(
      kitId,
      categoryId,
      questionResponse,
      completed,
    );
  }
}
