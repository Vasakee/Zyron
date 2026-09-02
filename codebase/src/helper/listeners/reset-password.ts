import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { POSTMARK_VERIFIED_EMAIL } from 'src/config/keys';
import { ResetPasswordEvent } from '../events/reset-password';
import { mailService } from '../../mail/mail';

@Injectable()
export class ResetPasswordListener {
  @OnEvent('reset.password', { async: true })
  async execute(event: ResetPasswordEvent) {
    const html = await mailService.renderHtml(
      {
        name: `${event.name}`,
        link: event.link,
      },
      'reset_password.html',
    );

    const msg = {
      to: event.email,
      from: POSTMARK_VERIFIED_EMAIL,
      subject: `Reset account password`,
      html: String(html),
    };

    await mailService.sendMail(msg);
  }
}
