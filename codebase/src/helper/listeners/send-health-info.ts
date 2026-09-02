import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { FRONTEND_URL, POSTMARK_VERIFIED_EMAIL } from 'src/config/keys';
import { mailService } from '../../mail/mail';
import { SendInfo } from '../events/send-info';
import { MailQueueTypes } from 'src/enum';

@Injectable()
export class SendHealthInfo {
  constructor(@InjectQueue('mail') private mailQueue: Queue) {}

  @OnEvent('send.health-info.form', { async: true })
  async handleVerifyAccountEvent(event: SendInfo) {
    const date = new Date();
    const year = date.getFullYear();
    const html = await mailService.renderHtml(
      {
        name: event.name,
        practitionerName: event.practitionerName,
        email: event.email,
        link: `${FRONTEND_URL}/client-health-information/${event.kitId}`,
        year,
      },
      'complete_health_info.html',
    );

    const msg = {
      to: event.email,
      from: POSTMARK_VERIFIED_EMAIL,
      subject: `Complete Health Information for Vitract Gut Test`,
      html: String(html),
    };

    await this.mailQueue.add(MailQueueTypes.SendMail, msg);
  }
}
