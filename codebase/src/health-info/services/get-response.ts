import { Injectable, Logger } from '@nestjs/common';
import { QuestionnaireResponseCacheService } from 'src/database/cache/response';

@Injectable()
export class GetUserResponseService {
  private readonly logger = new Logger(GetUserResponseService.name);

  constructor(
    private readonly questionnaireResponseCacheService: QuestionnaireResponseCacheService,
  ) {}

  async execute(kitId) {
    try {
      await this.questionnaireResponseCacheService.resetResponse(kitId);
      const result = this.questionnaireResponseCacheService.getResponse(kitId);
      return result;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
