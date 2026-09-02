import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FRONTEND_URL, POSTMARK_VERIFIED_EMAIL } from 'src/config/keys';
import { mailService } from '../../mail/mail';
import { notifyAdminEvent } from '../events/notify-admin';

@Injectable()
export class NotifyAdminListener {
  @OnEvent('notify.admin', { async: true })
  async handleInviteEvent(event: notifyAdminEvent) {
    
    const date = new Date();
    const year = date.getFullYear();
    const html = await mailService.renderHtml(
      {
        email: event.email,
        name: event.name,
        link: 'https://app.vitract.com/admin/customer-inquiry',
        year,
      },
      'notify_admin.html',
    );

    const msg = {
      to: event.email,
      from: POSTMARK_VERIFIED_EMAIL,
      subject: `Actions Required`,
     html: String(html),
    };

    await mailService.sendMail(msg);
  }
}
