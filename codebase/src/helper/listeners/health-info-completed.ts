import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { POSTMARK_VERIFIED_EMAIL } from 'src/config/keys';
import { mailService } from '../../mail/mail';
import { HealthInfoCompletedEvent } from '../events/health-info-completed';

@Injectable()
export class HealthInfoCompletedListener {
  @OnEvent('heath.info.completed', { async: true })
  async handleHealthInfoCompletedEvent(event: HealthInfoCompletedEvent) {
    const date = new Date();
    const year = date.getFullYear();
    const html = await mailService.renderHtml(
      {
        name: event.name,
        clientName: event.clientName,
        email: event.email,
        year,
      },
      'health_info_completed.html',
    );

    const msg = {
      to: event.email,
      from: POSTMARK_VERIFIED_EMAIL,
      subject: `Client Health Information Form Completed`,
      html: String(html),
    };

    await mailService.sendMail(msg);
  }
}
