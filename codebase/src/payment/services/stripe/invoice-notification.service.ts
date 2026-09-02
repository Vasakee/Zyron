import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { mailService } from 'src/mail/mail-v1';
import { POSTMARK_VERIFIED_EMAIL } from 'src/config';

@Injectable()
export class StripeInvoiceNotificationService {
  private readonly logger = new Logger(StripeInvoiceNotificationService.name);

  async execute(invoice: Stripe.Response<Stripe.Invoice>) {
    try {
      const clientName = invoice.metadata?.clientName || 'Valued Customer';
      const clientEmail = invoice.metadata?.clientEmail;

      if (!clientEmail) {
        this.logger.warn(`No email found for invoice ${invoice.id}`);
        return;
      }

      const templateData = {
        clientName,
        invoiceNumber: invoice.number || invoice.id,
        invoiceDate: new Date(invoice.created * 1000).toLocaleDateString(),
        periodStart: invoice.metadata?.billDate || 'N/A',
        periodEnd: invoice.metadata?.billDate || 'N/A',
        totalAmount: (invoice.total / 100).toFixed(2),
        currency: invoice.currency.toUpperCase(),
        invoiceUrl: invoice.hosted_invoice_url,
      };

      const htmlContent = await mailService.renderHtml(
        templateData,
        'invoice_notification.html',
      );

      await mailService.sendMail({
        From: POSTMARK_VERIFIED_EMAIL,
        To: clientEmail,
        Subject: `Your Vitract Invoice ${
          invoice.number || invoice.id
        } is Ready`,
        HtmlBody: htmlContent as string,
      });

      this.logger.log(
        `Invoice notification email sent to ${clientEmail} for invoice ${invoice.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send invoice notification email for ${invoice.id}:`,
        error,
      );
    }
  }
}
