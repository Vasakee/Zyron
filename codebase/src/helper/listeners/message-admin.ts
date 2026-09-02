import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FRONTEND_URL, POSTMARK_VERIFIED_EMAIL } from 'src/config/keys';
import { mailService } from '../../mail/mail';

import { messageAdminEvent } from '../events/message-admin';

@Injectable()
export class MessageAdminListener {
  @OnEvent('message.admin', { async: true })
  async handleInviteEvent(event: messageAdminEvent) {
    const date = new Date();
    const year = date.getFullYear();
    const html = await mailService.renderHtml(
      {
        email: event.email,
        name: event.name,
        link: `${FRONTEND_URL}/admin/customer-inquiry/detail?id=${
          event.id
        }&subject=${event.subject}&status=${event?.status ?? ''}&priority=${
          event?.priority ?? ''
        }&assignedTo=${event?.assignedTo ?? ''}`,
        year,
        subject: event.subject,
        caseId: event.caseId

      },
      'message_admin.html',
    );

    const msg = {
      to: event.email,
      from: POSTMARK_VERIFIED_EMAIL,
      subject: `You have a new message`,
      html: String(html),
    };

    await mailService.sendMail(msg);
  }
}
