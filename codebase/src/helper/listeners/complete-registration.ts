import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { POSTMARK_VERIFIED_EMAIL } from 'src/config/keys';
import { mailService } from '../../mail/mail';
import { CompleteRegistrationEvent } from '../events/complete-registration';

@Injectable()
export class CompleteRegistrationListener {
  @OnEvent('complete.registeration', { async: true })
  async handleCompleteRegistrationEvent(event: CompleteRegistrationEvent) {
    const date = new Date();
    const year = date.getFullYear();
    const html = await mailService.renderHtml(
      {
        name: event.name,
        email: event.email,
        link: event.link,
        year,
      },
      'complete_registration.html',
    );

    const msg = {
      to: event.email,
      from: POSTMARK_VERIFIED_EMAIL,
      subject: `Complete Account Registration`,
     html: String(html),
    };

    await mailService.sendMail(msg);
  }
}
