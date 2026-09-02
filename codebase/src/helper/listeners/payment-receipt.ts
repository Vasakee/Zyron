import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PaymentReceiptEvent } from '../events/payment-receipt';
import { mailService } from 'src/mail/mail';
import { POSTMARK_VERIFIED_EMAIL } from 'src/config/keys';

@Injectable()
export class PaymentReceiptListener {
  @OnEvent('payment.receipt', { async: true })
  async handle(event: PaymentReceiptEvent) {
    const subject = 'Your Vitract payment receipt';
    const html = (await mailService.renderHtml(event, 'payment_receipt.html')) as string;

    await mailService.sendMail({
      to: event.billedToEmail,
      from: POSTMARK_VERIFIED_EMAIL,
      subject,
      html,
    });
  }
}


