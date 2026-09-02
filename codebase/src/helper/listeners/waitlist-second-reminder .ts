import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { POSTMARK_VERIFIED_EMAIL } from 'src/config/keys';
import { mailService } from '../../mail/mail';
import { WaitlistEvent } from '../events/waitlist-first-payment';

@Injectable()
export class WaitListSecondReminderListener {
  @OnEvent('waitlist.email.second-waitlist-reminder', { async: true })
  async handleInviteEvent(event: WaitlistEvent) {
    console.log('listening');
    const date = new Date();
    const year = date.getFullYear();
    const html = await mailService.renderHtml(
      {
        email: event.email,
        name: event.name,
        year,
        quantity: event.quantity,
        link: event.link,
      },
      'waitlist_second_reminder.html',
    );

    const msg = {
      to: event.email,
      from: POSTMARK_VERIFIED_EMAIL,
      subject: `Final Payment Reminder`,
      html: String(html),
    };

    await mailService.sendMail(msg);
  }
}
