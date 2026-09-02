import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tutorials } from '../entity/tutorial.entity';
import { UploadTutorialDto } from '../dto/upload-tutorial.dto';
import { slugifyText } from 'src/common/utils';
import { S3BucketService } from 'src/aws/services/s3-bucket.service';
import { BUCKET_NAME, S3_ENDPOINT } from 'src/config';
import { ResourceTypes } from 'src/enum';

@Injectable()
export class UploadTutorialService {
  private readonly logger = new Logger(UploadTutorialService.name);

  constructor(
    @InjectRepository(Tutorials)
    private readonly tutorialRepo: Repository<Tutorials>,
    private readonly s3BucketService: S3BucketService,
  ) {}

  protected bucketName = BUCKET_NAME;

  async execute(data: UploadTutorialDto, file: Express.Multer.File) {
    try {
      const extension = file.originalname.split('.').pop();
      const timestamp = Date.now();
      const name = `${slugifyText(data.title)}-${timestamp}.${extension}`;

      await this.s3BucketService.s3Upload({
        file: file.buffer,
        bucket: this.bucketName,
        name,
        mimetype: file.mimetype,
      });

      const url = `${S3_ENDPOINT}/${name}`;

      // data.resourceType === ResourceTypes.VIDEO
      //   ? (data.imageUrl = url)
      //   : (data.documentUrl = url);
      if (data.resourceType === ResourceTypes.VIDEO) {
        data.imageUrl = url;
      } else if (data.resourceType === ResourceTypes.PDF) {
        data.documentUrl = url;
      } else if (data.resourceType === ResourceTypes.PPT) {
        data.pptUrl = url;
      }
      const dto = new UploadTutorialDto();

      const payload = dto.toEntity(data);

      const result = await this.tutorialRepo.save(payload);

      return dto.fromEntity(result);
    } catch (error) {
      this.logger.error;
      throw error;
    }
  }
}
