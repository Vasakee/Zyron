import { Injectable, Logger } from '@nestjs/common';
import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { IServerErrorException } from '../../common';
import { AWS_ACCESS_KEY, AWS_REGION, AWS_SECRET_KEY } from 'src/config';

@Injectable()
export class S3BucketService {
  private readonly logger = new Logger(S3BucketService.name);

  private readonly s3 = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY,
      secretAccessKey: AWS_SECRET_KEY,
    },
  });

  async s3Upload({ file, bucket, name, mimetype }): Promise<any> {
    const uploadParams = {
      Bucket: bucket,
      Key: String(name),
      Body: file,
      ContentType: mimetype,
    };

    try {
      const command = new PutObjectCommand(uploadParams);
      const uploadResponse = await this.s3.send(command);
      if (uploadResponse.$metadata.httpStatusCode !== 200) {
        throw new IServerErrorException('Could not upload file');
      }
      return uploadResponse;
    } catch (error) {
      this.logger.error(`Error uploading to S3: ${error.message}`);
      throw error;
    }
  }

  async getFiles(prefix: string, bucket: string): Promise<any> {
    const listObjectsCommand = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
    });

    return await this.s3.send(listObjectsCommand);
  }

  async s3Delete({
    bucket,
    filePath,
  }: {
    bucket: string;
    filePath: string | null;
  }): Promise<any> {
    try {
      if (!filePath || filePath.trim().length === 0) {
        this.logger.warn('File path is null or undefined');
        return;
      }

      const urlObj = new URL(filePath);
      const name = urlObj.pathname.split('/').pop();

      const deleteParams = {
        Bucket: bucket,
        Key: String(name),
      };

      const command = new DeleteObjectCommand(deleteParams);
      const deleteResponse = await this.s3.send(command);

      if (![200, 204].includes(deleteResponse.$metadata.httpStatusCode)) {
        throw new IServerErrorException('Could not delete file');
      }

      return deleteResponse;
    } catch (error) {
      this.logger.error(`Error deleting from S3: ${error.message}`);
      throw error;
    }
  }
}
