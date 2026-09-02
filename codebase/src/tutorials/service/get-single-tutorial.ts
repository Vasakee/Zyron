import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tutorials } from '../entity/tutorial.entity';
import { UploadTutorialDto } from '../dto/upload-tutorial.dto';

@Injectable()
export class GetSingleTutorialsService {
  private readonly logger = new Logger(GetSingleTutorialsService.name);

  constructor(
    @InjectRepository(Tutorials)
    private readonly tutorialRepo: Repository<Tutorials>,
  ) {}

  async execute(id: string) {
    try {
      const Tutorials = await this.tutorialRepo.findOne({
        where: { id },
      });

      return new UploadTutorialDto().fromEntity(Tutorials);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
