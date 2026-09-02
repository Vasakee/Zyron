import { Injectable } from '@nestjs/common';
import { S3BucketService } from 'src/aws/services/s3-bucket.service';
import { BUCKET_NAME } from 'src/config';

@Injectable()
export class GetReportFilesService {
  private readonly bucketName = 'latch-bio-repo';

  constructor(private readonly s3BucketService: S3BucketService) {}

  async execute(
    kidId: string,
  ): Promise<{ pdfUrl: string; csvUrl: string; fastQUrl: string }> {
    const prefix = `Input_Data_Folder/Vitract_BS_Samples_Zipped/${kidId}`;
    const listObjectsOutput = await this.s3BucketService.getFiles(
      prefix,
      this.bucketName,
    );

    if (!listObjectsOutput.Contents) {
      return { pdfUrl: '', csvUrl: '', fastQUrl: '' };
    }

    let pdfUrl = '';
    let csvUrl = '';
    let fastQUrl = '';

    for (const item of listObjectsOutput.Contents) {
      if (item.Key) {
        const url = `https://${this.bucketName}.s3.amazonaws.com/${item.Key}`;

        if (item.Key.endsWith('.pdf')) {
          pdfUrl = url;
        } else if (item.Key.endsWith('.csv')) {
          csvUrl = url;
        } else if (item.Key.endsWith('.zip')) {
          fastQUrl = url;
        }
      }
    }

    return { pdfUrl, csvUrl, fastQUrl };
  }
}
