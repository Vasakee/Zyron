import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { POSTMARK_VERIFIED_EMAIL } from 'src/config/keys';
import { mailService } from '../../mail/mail';
import { TrackingUpdateEvent } from '../events/tracking-update';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { MailQueueTypes } from 'src/enum';

@Injectable()
export class TrackingEmailListener {
  constructor(@InjectQueue('mail') private mailQueue: Queue) {}

  @OnEvent('tracking.email', { async: true })
  async handleInviteEvent(event: TrackingUpdateEvent) {
    const date = new Date();
    const year = date.getFullYear();
    const html = await mailService.renderHtml(
      {
        email: event.email,
        name: event.name?.trim() || 'there',
        year,
        orderNumber: event.orderNumber,
        trackingNumber: event.trackingNumber,
        trackingUrl: event.trackingUrl,
      },
      'tracking.html',
    );

    const msg = {
      to: event.email,
      from: POSTMARK_VERIFIED_EMAIL,
      subject: `Your Order Is On Its Way`,
      html: String(html),
    };

    await this.mailQueue.add(MailQueueTypes.SendMail, msg, {
      delay: 3000,
    });
  }
}
