import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FRONTEND_URL, POSTMARK_VERIFIED_EMAIL } from 'src/config/keys';
import { mailService } from '../../mail/mail';
import { invitePractitionerEvent } from '../events/invite-practitioner';

@Injectable()
export class AcceptPractitionerListener {
  @OnEvent('accept.practitioner', { async: true })
  async handleInviteEvent(event: invitePractitionerEvent) {
    const date = new Date();
    const year = date.getFullYear();
    const html = await mailService.renderHtml(
      {
        email: event.email,
        name: event.name,
        year,
      },
      'welcome_message.html',
    );

    const msg = {
      to: event.email,
      from: POSTMARK_VERIFIED_EMAIL,
      subject: `Your practitioner account has been approved`,
      html: String(html),
    };

    await mailService.sendMail(msg);
  }
}
