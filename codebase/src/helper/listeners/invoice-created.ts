import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { POSTMARK_VERIFIED_EMAIL } from 'src/config/keys';
import { mailService } from '../../mail/mail';

@Injectable()
export class InvoiceCreatedListener {
  private readonly logger = new Logger(InvoiceCreatedListener.name);

  @OnEvent('invoice.created', { async: true })
  async handleInvoiceCreated(payload: {
    userId: string;
    invoiceId: string;
    invoiceNumber: string;
    invoiceUrl: string;
    clientName: string;
    clientEmail: string;
    totalAmount: string;
    currency: string;
    periodStart: Date;
    periodEnd: Date;
    dueDate: Date;
  }) {
    try {
      this.logger.log(
        `Processing invoice created event for user ${payload.userId}, invoice ${payload.invoiceId}`,
      );

      // Format dates
      const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(date);
      };

      const year = new Date().getFullYear();
      const html = await mailService.renderHtml(
        {
          clientName: payload.clientName,
          invoiceNumber: payload.invoiceNumber,
          invoiceDate: formatDate(new Date()),
          periodStart: formatDate(payload.periodStart),
          periodEnd: formatDate(payload.periodEnd),
          totalAmount: payload.totalAmount,
          currency: payload.currency,
          invoiceUrl: payload.invoiceUrl,
          year,
        },
        'invoice_notification.html',
      );

      const msg = {
        to: payload.clientEmail,
        from: POSTMARK_VERIFIED_EMAIL,
        subject: `Your Vitract Invoice ${payload.invoiceNumber}`,
        html: String(html),
      };

      await mailService.sendMail(msg);

      this.logger.log(
        `Invoice email notification sent successfully for invoice ${payload.invoiceId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send invoice email notification for invoice ${payload.invoiceId}:`,
        error,
      );
    }
  }
}
