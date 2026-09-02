import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tutorials } from '../entity/tutorial.entity';
import { ConflictErrorException } from 'src/common';
import { UpdateTutorialDto } from '../dto/update-tutorial.dto';
import { S3BucketService } from 'src/aws/services/s3-bucket.service';
import { BUCKET_NAME, S3_ENDPOINT } from 'src/config';
import { slugifyText } from 'src/common/utils';
import { ResourceTypes } from 'src/enum';

@Injectable()
export class UpdateTutorialStatusService {
  private readonly logger = new Logger(UpdateTutorialStatusService.name);

  constructor(
    @InjectRepository(Tutorials)
    private readonly TutorialRepo: Repository<Tutorials>,
    private readonly s3BucketService: S3BucketService,
  ) {}

  protected bucketName = BUCKET_NAME;

  async execute(
    TutorialId: string,
    data: UpdateTutorialDto,
    file?: Express.Multer.File,
  ) {
    try {
      const TutorialRecord = await this.TutorialRepo.findOne({
        where: { id: TutorialId },
      });

      if (!TutorialRecord) {
        throw new ConflictErrorException('Tutorial not found');
      }

      if (file) {
        const extension = file.originalname.split('.').pop();
        const timestamp = Date.now();
        const name = `${slugifyText(data.title)}-${timestamp}.${extension}`;

        await this.s3BucketService.s3Upload({
          file: file.buffer,
          bucket: this.bucketName,
          name,
          mimetype: file.mimetype,
        });

        switch (TutorialRecord.resourceType) {
          case ResourceTypes.VIDEO:
            await this.s3BucketService.s3Delete({
              bucket: this.bucketName,
              filePath: TutorialRecord.imageUrl,
            });
            break;

          case ResourceTypes.PDF:
            await this.s3BucketService.s3Delete({
              bucket: this.bucketName,
              filePath: TutorialRecord.documentUrl,
            });
            break;

          case ResourceTypes.PPT:
            await this.s3BucketService.s3Delete({
              bucket: this.bucketName,
              filePath: TutorialRecord.pptUrl,
            });
            break;

          default:
            break;
        }

        const url = `${S3_ENDPOINT}/${name}`;

        switch (data.resourceType) {
          case ResourceTypes.VIDEO:
            data.imageUrl = url;
            break;

          case ResourceTypes.PDF:
            data.documentUrl = url;
            break;

          case ResourceTypes.PPT:
            data.pptUrl = url;
            break;

          default:
            break;
        }
      }

      const Dto = new UpdateTutorialDto();
      const payload = Dto.toEntity(TutorialRecord, data);
      const result = await this.TutorialRepo.save(payload);

      return Dto.fromEntity(result);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}