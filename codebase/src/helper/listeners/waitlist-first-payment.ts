import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { POSTMARK_VERIFIED_EMAIL } from 'src/config/keys';
import { mailService } from '../../mail/mail';
import { WaitlistEvent } from '../events/waitlist-first-payment';

@Injectable()
export class WaitListFirstPaymentListener {
  @OnEvent('waitlistfirst.email', { async: true })
  async handleInviteEvent(event: WaitlistEvent) {
    console.log('listening');
    const date = new Date();
    const year = date.getFullYear();
    const html = await mailService.renderHtml(
      {
        email: event.email,
        practitionerName: event.name,
        year,
        quantity: event.quantity,
      },
      'waitlist_first_payment.html',
    );

    const msg = {
      to: event.email,
      from: POSTMARK_VERIFIED_EMAIL,
      subject: `DeepGut Waitlist Confirmation`,
      html: String(html),
    };

    await mailService.sendMail(msg);
  }
}
