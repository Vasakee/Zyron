import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FRONTEND_URL, POSTMARK_VERIFIED_EMAIL } from 'src/config/keys';
import { VerifyAccountEvent } from '../events/verify-account';
import { mailService } from '../../mail/mail';
import { TransferEvent } from '../events/transfer';

@Injectable()
export class VerifyTransferListener {
  @OnEvent('verify.transfer.account', { async: true })
  async handleVerifyAccountEvent(event: TransferEvent) {
    const date = new Date();
    const year = date.getFullYear();
    const html = await mailService.renderHtml(
      {
        name: event.name,
        newEmail: event.newEmail,
        link: `${FRONTEND_URL}/complete-transfer?token=${event.token}&email=${event.newEmail}`,
        year,
      },
      'verify_transfer.html',
    );

    const msg = {
      to: event.newEmail,
      from: POSTMARK_VERIFIED_EMAIL,
      subject: `Complete Account Transfer`,
      html: String(html),
    };

    await mailService.sendMail(msg);
  }
}
