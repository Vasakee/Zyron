import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FRONTEND_URL, POSTMARK_VERIFIED_EMAIL } from 'src/config/keys';
import { mailService } from '../../mail/mail';
import { invitePractitionerEvent } from '../events/invite-practitioner';

@Injectable()
export class NewPractitionerListener {
  @OnEvent('invite.practitioner', { async: true })
  async handleInviteEvent(event: invitePractitionerEvent) {
    console.log('listen', 'inviting practitioner');
    const date = new Date();
    const year = date.getFullYear();
    const html = await mailService.renderHtml(
      {
        name: event.name,
        email: event.email,
        link: `${FRONTEND_URL}/practitioner-registration`,
        year,
      },
      'invitePractitioner.html',
    );

    const msg = {
      to: event.email,
      from: POSTMARK_VERIFIED_EMAIL,
      subject: `Invitation to join Vitract`,
     html: String(html),
    };

    await mailService.sendMail(msg);
  }
}
