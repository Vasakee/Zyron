import { Injectable } from '@nestjs/common';
import { QuestionnaireResponseCacheService } from 'src/database/cache/response';
import { SetAgreementDto } from '../dto/set-agreement.dto';

@Injectable()
export class SetAgreementService {
  constructor(
    private readonly questionnaireResponseCacheService: QuestionnaireResponseCacheService,
  ) {}

  async execute(data: SetAgreementDto): Promise<void> {
    const { kitId, acceptedTerms, acceptedPolicy } = data;

    await this.questionnaireResponseCacheService.setAgreement(kitId, {
      kitId,
      acceptedTerms,
      acceptedPolicy,
    });
  }
}
