import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FRONTEND_URL, POSTMARK_VERIFIED_EMAIL } from 'src/config/keys';
import { VerifyAccountEvent } from '../events/verify-account';
import { mailService } from '../../mail/mail';
import { TransferEvent } from '../events/transfer';

@Injectable()
export class InitiateTransferListener {
  @OnEvent('initiate.transfer', { async: true })
  async handleVerifyAccountEvent(event: TransferEvent) {
    const date = new Date();
    const year = date.getFullYear();
    const html = await mailService.renderHtml(
      {
        name: event.name,
        email: event.email,
        link: `${FRONTEND_URL}/verify-transfer?token=${event.token}`,
        year,
      },
      'initiate_transfer.html',
    );

    const msg = {
      to: event.email,
      from: POSTMARK_VERIFIED_EMAIL,
      subject: `Verify Account Transfer`,
      html: String(html),
    };

    try {
      await mailService.sendMail(msg);
    } catch (error) {
      console.log(error);
    }
  }
}
