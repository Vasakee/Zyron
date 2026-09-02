import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { MailQueueTypes } from 'src/enum';
import { SupportResponseEvent } from '../events/support-response';
import { POSTMARK_SUPPORT_EMAIL } from 'src/config';

@Injectable()
export class SupportResponseListener {
  constructor(@InjectQueue('mail') private mailQueue: Queue) {}
  @OnEvent('support.response', { async: true })
  async execute(event: SupportResponseEvent) {
    const msg = {
      from: POSTMARK_SUPPORT_EMAIL,
      to: event.email,
      subject: `Re: Support Request: ${event.subject}`,
      html: event.content,
      messageId: `<${event.messageId}@mailgun.vitract.com>`,
      initialMessageId: event.initialMessageId,
      supportId: event.supportId,
      supportMessageId: event.supportMessageId,
    };
    if (event.initialMessageId) {
      console.log('reply');
      msg['h:In-Reply-To'] = event.initialMessageId;
      msg['h:References'] = event.initialMessageId;
    } else {
      msg['h:Message-ID'] = `<${event.messageId}@mailgun.vitract.com>`;
    }

    await this.mailQueue.add(MailQueueTypes.SendSupportMail, msg, {
      delay: 3000,
    });
  }
}
