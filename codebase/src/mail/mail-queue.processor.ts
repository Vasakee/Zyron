import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { MailQueueTypes, SupoortMailStatus } from 'src/enum';
import { mailService } from './mail';
import { MessageSendingResponse } from 'postmark/dist/client/models';
import {
  IntialSupportMailType,
  MailGunMessageInterface,
  MailGunTemplateMessageInterface,
  SupportMailType,
} from './types';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Support } from 'src/support/entity/support.entity';
import { Logger } from '@nestjs/common';
import { SupportMessage } from 'src/support/entity/support-message.entity';
import { dbconfig } from 'src/config';

@Processor('mail')
export class MailConsumer {
  private readonly logger = new Logger(MailConsumer.name);
  private dataSource: DataSource;

  constructor() {
    this.dataSource = new DataSource(
      dbconfig.getTypeOrmConfig() as DataSourceOptions,
    );
    this.dataSource.initialize();
  }

  @Process({ name: MailQueueTypes.SendMail, concurrency: 5 })
  async handleSendMail(
    job: Job<MailGunMessageInterface>,
  ): Promise<MessageSendingResponse> {
    const response = await mailService.sendMail(job.data);
    return response;
  }

  @Process({ name: MailQueueTypes.SendMailWithTemplate, concurrency: 5 })
  async handleSendMailWithTemplate(
    job: Job<MailGunTemplateMessageInterface>,
  ): Promise<MessageSendingResponse> {
    const response = await mailService.sendEMailWithTemplate(job.data);
    return response;
  }

  @Process({ name: MailQueueTypes.SendInitialSupportMail, concurrency: 2 })
  async handleInitialSupportMail(
    job: Job<IntialSupportMailType>,
  ): Promise<MessageSendingResponse | undefined> {
    try {
      const result = await this.dataSource.transaction(async () => {
        const response = await mailService.sendMail(job.data as any);
        return response;
      });
      return result;
    } catch (error) {
      this.logger.error(error);
    }
  }

  @Process({ name: MailQueueTypes.SendSupportMail, concurrency: 2 })
  async handleSupportMail(
    job: Job<SupportMailType>,
  ): Promise<MessageSendingResponse | undefined> {
    try {
      const result = await this.dataSource.transaction(async (manager) => {
        const response = await mailService.sendMail(job.data as any);

        const support = await manager.findOne(Support, {
          where: { id: job.data.supportId },
        });
        if (
          support &&
          (!job.data.initialMessageId || job.data.initialMessageId === null)
        ) {
          support.messageId = job.data.messageId;
          await manager.save(Support, support);
        }

        if (job.data.supportMessageId) {
          await manager.update(
            SupportMessage,
            { id: job.data.supportMessageId },
            { status: SupoortMailStatus.SENT },
          );
        }

        return response;
      });
      return result;
    } catch (error) {
      this.logger.error(error);
    }
  }
}
