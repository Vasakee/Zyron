import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FRONTEND_URL, POSTMARK_VERIFIED_EMAIL } from 'src/config/keys';
import { VerifyAccountEvent } from '../events/verify-account';
import { mailService } from '../../mail/mail';

@Injectable()
export class VerifyAccountListener {
  @OnEvent('verify.account', { async: true })
  async handleVerifyAccountEvent(event: VerifyAccountEvent) {
    const date = new Date();
    const year = date.getFullYear();
    const html = await mailService.renderHtml(
      {
        name: event.name,
        email: event.email,
        link: `${FRONTEND_URL}/verify/${event.signUpToken}`,
        year,
      },
      'verify_account.html',
    );

    const msg = {
      to: event.email,
      from: POSTMARK_VERIFIED_EMAIL,
      subject: `Validate Email`,
     html: String(html),
    };

    await mailService.sendMail(msg);
  }
}
