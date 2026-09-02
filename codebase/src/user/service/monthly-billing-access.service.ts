import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import {
  BadRequestErrorException,
  NotFoundErrorException,
} from 'src/common/filters/error-exceptions';
import { QueueService } from 'src/queues/services/queue.service';
import { BillingAccessJobData } from 'src/queues/types/queue.types';
import { FileProcessingUtils } from 'src/common/utils';

@Injectable()
export class MonthlyBillingAccessService {
  private readonly logger = new Logger(MonthlyBillingAccessService.name);
  private readonly bulkChunkSize = 200;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly queueService: QueueService,
  ) {}

  async setAccessByEmail(email: string, enable: boolean) {
    const normalizedEmail = FileProcessingUtils.normalizeEmail(email);
    if (!normalizedEmail) {
      throw new BadRequestErrorException('A valid email address is required');
    }

    const user = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new NotFoundErrorException(
        `User with email ${normalizedEmail} was not found`,
      );
    }

    user.monthlyBillingAccess = enable;
    await this.userRepository.save(user);

    this.logger.log(
      `Monthly billing access ${
        enable ? 'enabled' : 'disabled'
      } for ${normalizedEmail}`,
    );

    return {
      email: normalizedEmail,
      monthlyBillingAccess: enable,
    };
  }

  async enqueueBulkAccess(
    file: Express.Multer.File,
    enable = true,
    requestedBy?: string | null,
  ) {
    if (!file) {
      throw new BadRequestErrorException('An upload file is required');
    }

    let emails: string[];
    try {
      emails = await FileProcessingUtils.extractEmailsFromFile(file);
    } catch (error) {
      throw new BadRequestErrorException(
        error.message || 'Failed to process uploaded file',
      );
    }
    if (!emails.length) {
      throw new BadRequestErrorException(
        'No valid email addresses were found in the uploaded file',
      );
    }

    const uniqueEmails = Array.from(new Set(emails));
    const batches = FileProcessingUtils.chunk(uniqueEmails, this.bulkChunkSize);
    let batchIndex = 0;

    for (const batch of batches) {
      const jobData: BillingAccessJobData = {
        emails: batch,
        enable,
        requestedBy: requestedBy ?? null,
      };

      await this.queueService.addBillingAccessJob(jobData, {
        removeOnComplete: true,
        removeOnFail: 25,
        jobId: `${file.originalname}-${Date.now()}-${batchIndex++}`,
      });
    }

    this.logger.log(
      `Queued monthly billing access update for ${uniqueEmails.length} emails spread across ${batches.length} batches`,
    );

    return {
      queued: uniqueEmails.length,
      batches: batches.length,
      enable,
    };
  }

  async applyAccessToEmails(emails: string[], enable: boolean) {
    if (!emails.length) {
      return { updated: 0 };
    }

    const normalized = Array.from(
      new Set(
        emails
          .map((email) => FileProcessingUtils.normalizeEmail(email))
          .filter((value): value is string => Boolean(value)),
      ),
    );

    if (!normalized.length) {
      return { updated: 0 };
    }

    const result = await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ monthlyBillingAccess: enable })
      .where('email IN (:...emails)', { emails: normalized })
      .execute();

    const affected = result.affected ?? 0;
    if (affected && enable) {
      this.logger.log(`Enabled monthly billing access for ${affected} users`);
    } else if (affected) {
      this.logger.log(`Disabled monthly billing access for ${affected} users`);
    }

    return {
      updated: affected,
      enable,
    };
  }
}
