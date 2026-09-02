import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import {
  BillingAccessJobData,
  JobTypes,
  QueueNames,
} from '../types/queue.types';

@Injectable()
@Processor(QueueNames.BILLING_ACCESS)
export class BillingAccessProcessor {
  private readonly logger = new Logger(BillingAccessProcessor.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Process(JobTypes.PROCESS_BILLING_ACCESS_FILE)
  async processBillingAccess(job: Job<BillingAccessJobData>) {
    const { emails, enable = true, requestedBy } = job.data;

    this.logger.log(
      `Processing billing access for ${emails.length} emails (enable: ${enable})`,
      { jobId: job.id, requestedBy },
    );

    try {
      const result = await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({ monthlyBillingAccess: enable })
        .where('email IN (:...emails)', { emails })
        .execute();

      const affected = result.affected ?? 0;

      this.logger.log(
        `Billing access ${
          enable ? 'enabled' : 'disabled'
        } for ${affected} users`,
        { jobId: job.id, requestedBy },
      );

      return {
        processed: emails.length,
        updated: affected,
        enable,
        requestedBy,
      };
    } catch (error) {
      this.logger.error('Failed to process billing access job', {
        error: error.message,
        jobId: job.id,
        emailCount: emails.length,
        requestedBy,
      });
      throw error;
    }
  }
}
