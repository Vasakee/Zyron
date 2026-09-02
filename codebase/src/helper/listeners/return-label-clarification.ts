import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { POSTMARK_VERIFIED_EMAIL } from 'src/config/keys';
import { mailService } from '../../mail/mail';
import { ReturnLabelClarificationEvent } from '../events/return-label-clarification';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { MailQueueTypes } from 'src/enum';

@Injectable()
export class ReturnLabelClarificationListener {
  private readonly logger = new Logger(ReturnLabelClarificationListener.name);

  constructor(@InjectQueue('mail') private mailQueue: Queue) {}

  @OnEvent('return-label.clarification', { async: true })
  async handleReturnLabelClarificationEvent(
    event: ReturnLabelClarificationEvent,
  ) {
    try {
      this.logger.log(
        `Preparing return label clarification email for ${event.email}`,
      );

      const html = await mailService.renderHtml(
        {
          email: event.email,
          name: event.name?.trim() || 'there',
        },
        'return-label-clarification.html',
      );

      const msg = {
        to: event.email,
        from: POSTMARK_VERIFIED_EMAIL,
        subject: `Important: Use the Return Label Inside Your Envelope`,
        html: String(html),
      };

      await this.mailQueue.add(MailQueueTypes.SendMail, msg, {
        delay: 3000,
      });

      this.logger.log(
        `Return label clarification email sent successfully to ${event.email}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send return label clarification email to ${event.email}:`,
        error,
      );
      throw error;
    }
  }
}
