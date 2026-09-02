import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { POSTMARK_VERIFIED_EMAIL } from 'src/config/keys';
import { mailService } from '../../mail/mail';
import { SampleCollectionGuidelineEvent } from '../events/sample-collection-guideline';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { MailQueueTypes } from 'src/enum';

@Injectable()
export class SampleCollectionGuidelineListener {
  private readonly logger = new Logger(SampleCollectionGuidelineListener.name);

  constructor(@InjectQueue('mail') private mailQueue: Queue) {}

  @OnEvent('sample-collection.guideline', { async: true })
  async handleSampleCollectionGuidelineEvent(
    event: SampleCollectionGuidelineEvent,
  ) {
    try {
      this.logger.log(
        `Preparing sample collection guideline email for ${event.email}`,
      );

      const date = new Date();
      const year = date.getFullYear();
      const html = await mailService.renderHtml(
        {
          email: event.email,
          name: event.name?.trim() || 'there',
          orderNumber: event.orderNumber,
          trackingNumber: event.trackingNumber,
          trackingUrl: event.trackingUrl,
          year,
        },
        'sample-collection-guideline.html',
      );

      const msg = {
        to: event.email,
        from: POSTMARK_VERIFIED_EMAIL,
        subject: 'How to Collect Your Sample Correctly',
        html: String(html),
      };

      await this.mailQueue.add(MailQueueTypes.SendMail, msg, {
        delay: 3000,
      });

      this.logger.log(
        `Sample collection guideline email sent successfully to ${event.email}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send sample collection guideline email to ${event.email}:`,
        error,
      );
      throw error;
    }
  }
}
