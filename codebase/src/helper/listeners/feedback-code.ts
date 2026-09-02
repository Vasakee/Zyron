import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { POSTMARK_VERIFIED_EMAIL } from 'src/config/keys';
import { mailService } from '../../mail/mail';
import { FeedbackCodeEvent } from '../events/feedback-code';

@Injectable()
export class FeedbackCodeListener {
  @OnEvent('send.discount', { async: true })
  async handleEvent(event: FeedbackCodeEvent) {
    const year = new Date().getFullYear();
    const html = await mailService.renderHtml(
      {
        email: event.email,
        name: event.name,
        code: event.code,
        year,
      },
      'send_feedback_code.html',
    );

    const msg = {
      to: event.email,
      from: POSTMARK_VERIFIED_EMAIL,
      subject: `Enjoy for 10% discount for Future Purchase`,
     html: String(html),
    };

    await mailService.sendMail(msg);
  }
}
