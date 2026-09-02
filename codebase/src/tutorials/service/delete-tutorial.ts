import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tutorials } from '../entity/tutorial.entity';
import { ConflictErrorException } from 'src/common';
import { S3BucketService } from 'src/aws/services/s3-bucket.service';
import { BUCKET_NAME } from 'src/config';

@Injectable()
export class DeleteTutorialsService {
  private readonly logger = new Logger(DeleteTutorialsService.name);

  constructor(
    @InjectRepository(Tutorials)
    private readonly tutorialRepo: Repository<Tutorials>,
    private readonly s3BucketService: S3BucketService,
  ) {}

  protected bucketName = BUCKET_NAME;

  async execute(id: string) {
    try {
      const TutorialRecord = await this.tutorialRepo.findOne({
        where: { id },
      });

      if (!TutorialRecord) {
        throw new ConflictErrorException('Tutorial not found');
      }

      // Delete the associated image from S3 if it exists
      for (const url of [
        TutorialRecord.imageUrl,
        TutorialRecord.documentUrl,
        TutorialRecord.pptUrl,
      ]) {
        // If a URL exists, extract the name and delete the file from S3
        if (url) {
          await this.s3BucketService.s3Delete({
            bucket: this.bucketName,
            filePath: url,
          });
        }
      }

      // Delete the tutorial record from the database
      await this.tutorialRepo.delete({
        id,
      });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
