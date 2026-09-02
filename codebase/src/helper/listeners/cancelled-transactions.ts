import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { POSTMARK_VERIFIED_EMAIL } from 'src/config/keys';
import { mailService } from '../../mail/mail';
import { CancelledTransactionEvent } from '../events/cancelled-transactions';

@Injectable()
export class CancelledTransactionListener {
  @OnEvent('cancelled.transaction', { async: true })
  async handleEvent(event: CancelledTransactionEvent) {

    const year = new Date().getFullYear();
    const html = await mailService.renderHtml(
      {
        email: event.email,
        name: event.name,
        year,
      },
      'cancelled_transactions.html',
    );

    const msg = {
      to: event.email,
      from: POSTMARK_VERIFIED_EMAIL,
      subject: `Complete your Vitract Test purchase with Ultra Discount`,      
     html: String(html),
    };

    await mailService.sendMail(msg);
  }
}
