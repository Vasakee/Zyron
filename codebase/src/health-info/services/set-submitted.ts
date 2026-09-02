import { Injectable, Logger } from '@nestjs/common';
import { QuestionnaireResponseCacheService } from 'src/database/cache/response';
import { setSubmittedDto } from '../dto/set-submitted.dto';

@Injectable()
export class SetSubmittedService {
  private readonly logger = new Logger(SetSubmittedService.name);

  constructor(
    private readonly questionnaireResponseCacheService: QuestionnaireResponseCacheService,
  ) {}

  async setSubmittedStatus(data: setSubmittedDto): Promise<void> {
    try {
      const { kitId, submitted } = data;

      await this.questionnaireResponseCacheService.setSubmitted(
        kitId,
        submitted,
      );
    } catch (error) {
      this.logger.error(
        `Failed to set submitted status for kitId: ${data.kitId}`,
        error,
      );
      throw error;
    }
  }
}
