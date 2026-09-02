import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { POSTMARK_VERIFIED_EMAIL, BUCKET_NAME } from 'src/config/keys';
import { mailService } from '../../mail/mail';
import { PdfGeneratorService } from '../../services/pdf-generator.service';
import { RetrieveInvoiceService } from '../../payment/services/retrieve-invoice';
import { S3BucketService } from '../../aws/services/s3-bucket.service';
import { PaymentStatement } from '../../payment/entity/payment-statement.entity';
import Stripe from 'stripe';

export interface InvoicePaidPayload {
  userId: string;
  invoiceId: string;
  invoiceNumber?: string;
  invoicePdf?: string;
  clientName: string;
  clientEmail: string;
  totalAmount: number;
  currency: string;
  paidAt: Date;
}

@Injectable()
export class InvoicePaidListener {
  private readonly logger = new Logger(InvoicePaidListener.name);
  private readonly processingInvoices = new Set<string>();

  constructor(
    private readonly pdfGeneratorService: PdfGeneratorService,
    private readonly retrieveInvoiceService: RetrieveInvoiceService,
    private readonly s3BucketService: S3BucketService,
    @InjectRepository(PaymentStatement)
    private readonly paymentStatementRepository: Repository<PaymentStatement>,
  ) {}

  async handle(payload: InvoicePaidPayload): Promise<void> {
    if (this.processingInvoices.has(payload.invoiceId)) {
      this.logger.warn(
        `Invoice ${payload.invoiceId} is already being processed, skipping duplicate event`,
      );
      return;
    }

    this.processingInvoices.add(payload.invoiceId);

    try {
      this.logger.log(
        `Processing invoice paid event for user ${payload.userId}, invoice ${payload.invoiceId}`,
      );

      // Fetch the Stripe invoice to get complete data for PDF generation
      let stripeInvoice: Stripe.Invoice;
      try {
        stripeInvoice = await this.retrieveInvoiceService.execute(
          payload.invoiceId,
          {
            expand: ['lines', 'customer', 'charge', 'payment_intent'],
          },
        );
      } catch (error) {
        this.logger.error(
          `Failed to fetch Stripe invoice ${payload.invoiceId}:`,
          error,
        );
        return;
      }

      // Generate custom PDF using our service
      let pdfBuffer: Buffer;
      try {
        pdfBuffer = await this.pdfGeneratorService.generateCustomInvoicePdf(
          stripeInvoice,
        );

        this.logger.log(
          `PDF generated successfully for invoice ${payload.invoiceId}, size: ${pdfBuffer.length} bytes`,
        );

        // Validate PDF buffer has content
        if (pdfBuffer.length === 0) {
          this.logger.error(
            `Generated PDF is empty for invoice ${payload.invoiceId}`,
          );
          return;
        }
      } catch (error) {
        this.logger.error(
          `Failed to generate custom invoice PDF for invoice ${payload.invoiceId}:`,
          error,
        );
        return;
      }

      // Upload PDF to S3
      let s3PdfUrl: string;
      try {
        const fileName = `invoices/vitract-invoice-${
          payload.invoiceNumber || payload.invoiceId
        }.pdf`;

        await this.s3BucketService.s3Upload({
          file: pdfBuffer,
          bucket: BUCKET_NAME,
          name: fileName,
          mimetype: 'application/pdf',
        });

        // Construct the S3 URL
        s3PdfUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${fileName}`;

        this.logger.log(
          `Invoice PDF uploaded to S3: ${s3PdfUrl} for invoice ${payload.invoiceId}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to upload invoice PDF to S3 for invoice ${payload.invoiceId}:`,
          error,
        );
        return;
      }

      // Update PaymentStatement with S3 URL
      try {
        await this.paymentStatementRepository.update(
          { invoiceId: payload.invoiceId },
          { invoicePdf: s3PdfUrl },
        );

        this.logger.log(
          `Updated PaymentStatement with S3 PDF URL for invoice ${payload.invoiceId}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to update PaymentStatement with S3 URL for invoice ${payload.invoiceId}:`,
          error,
        );
      }

      // Format currency amount for email
      const formatAmount = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency.toUpperCase(),
        }).format(amount / 100); // Convert from cents
      };

      // Format date for email
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
          invoiceNumber: payload.invoiceNumber || payload.invoiceId,
          paidDate: formatDate(payload.paidAt),
          totalAmount: formatAmount(payload.totalAmount, payload.currency),
          currency: payload.currency.toUpperCase(),
          year,
        },
        'invoice_payment_confirmation.html',
      );

      const msg = {
        to: payload.clientEmail,
        from: POSTMARK_VERIFIED_EMAIL,
        subject: `Payment Confirmed - Invoice ${
          payload.invoiceNumber || payload.invoiceId
        }`,
        html: String(html),
        attachment: [
          {
            filename: `vitract-invoice-${
              payload.invoiceNumber || payload.invoiceId
            }.pdf`,
            data: pdfBuffer,
          },
        ],
      };

      // Log email details before sending
      this.logger.log(
        `Sending email for invoice ${payload.invoiceId} to ${payload.clientEmail} with PDF attachment (${pdfBuffer.length} bytes)`,
      );

      await mailService.sendMail(msg);

      this.logger.log(
        `Invoice payment confirmation email with custom PDF sent successfully for invoice ${payload.invoiceId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send invoice payment confirmation email for invoice ${payload.invoiceId}:`,
        error,
      );
    } finally {
      // Remove from processing set when done (success or failure)
      this.processingInvoices.delete(payload.invoiceId);
    }
  }
}
