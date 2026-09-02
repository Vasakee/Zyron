import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { POSTMARK_VERIFIED_EMAIL } from 'src/config/keys';
import { mailService } from '../../mail/mail';
import { SupportInitialResponseEvent } from '../events/support-initial-response';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { MailQueueTypes } from 'src/enum';

@Injectable()
export class SupportInitialResponseListener {
  constructor(@InjectQueue('mail') private mailQueue: Queue) {}
  @OnEvent('support.initial.response', { async: true })
  async execute(event: SupportInitialResponseEvent) {
    const html = await mailService.renderHtml(
      {
        name: `${event.name}`,
        subject: event.subject,
      },
      'support_initial_response.html',
    );

    const msg = {
      to: event.email,
      from: POSTMARK_VERIFIED_EMAIL,
      subject: `Acknowledgement of Your Support Request`,
      html: String(html),
      supportId: event.supportId,
    };

    await this.mailQueue.add(MailQueueTypes.SendInitialSupportMail, msg, {
      delay: 3000,
    });
  }
}
