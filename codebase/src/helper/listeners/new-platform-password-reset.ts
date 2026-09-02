import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { POSTMARK_VERIFIED_EMAIL } from 'src/config/keys';
import { mailService } from '../../mail/mail';
import { NewPlatformPasswordResetEvent } from '../events/new-platform-password-reset';

@Injectable()
export class NewPlatformPasswordResetListener {
  @OnEvent('new.platform.password.reset', { async: true })
  async execute(event: NewPlatformPasswordResetEvent) {
    const html = await mailService.renderHtml(
      {
        name: `${event.name}`,
        link: event.link,
      },
      'new_platform_password_reset.html',
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
