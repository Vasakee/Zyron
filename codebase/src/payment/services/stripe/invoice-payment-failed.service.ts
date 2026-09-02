import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import Stripe from 'stripe';
import { PaymentStatement } from 'src/payment/entity/payment-statement.entity';
import { Order } from 'src/order/entity/order.entity';
import { Transaction } from 'src/payment/entity/transaction.entity';
import {
  PaymentStatementStatus,
  OrderStatus,
  TransactionStatus,
  PaymentGateway,
  PaymentType,
} from 'src/enum';
import { STRIPE_API_KEY } from 'src/config';

@Injectable()
export class InvoicePaymentFailedService {
  private readonly logger = new Logger(InvoicePaymentFailedService.name);
  private stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2024-06-20' });

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async execute(invoice: Stripe.Invoice): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const statements = await manager.getRepository(PaymentStatement).find({
        where: { invoiceId: invoice.id },
      });

      if (statements.length === 0) {
        this.logger.warn(
          `No payment statements found for invoice ${invoice.id}`,
        );
        return;
      }

      const userId = statements[0].userId;

      const failureReason = await this.extractFailureReason(invoice);

      // 2) If invoice was charge_automatically → convert to send_invoice and send
      if (invoice.collection_method === 'charge_automatically') {
        this.logger.warn(
          `Auto-charge failed for invoice ${invoice.id}. Switching to send_invoice...`,
        );

        await this.stripe.invoices.sendInvoice(invoice.id);

        // Update statements WITHOUT marking them failed
        for (const stmt of statements) {
          if (failureReason) {
            stmt.failureReason = failureReason;
          }

          await manager.getRepository(PaymentStatement).save(stmt);
        }

        this.logger.log(
          `Invoice ${invoice.id} converted to send_invoice and sent. Statements updated for user ${userId}`,
        );
        return;
      }

      // 3) Otherwise (not charge_automatically) → classify as failed and create a failed transaction
      this.logger.warn(
        `Payment failed for non-auto-collect invoice ${invoice.id}. Marking statements failed and creating Transaction.`,
      );

      // Mark statements as failed
      for (const stmt of statements) {
        stmt.status = PaymentStatementStatus.PaymentFailed;
        stmt.failureReason = failureReason ?? 'Payment failed';
        stmt.invoiceStatus = invoice.status as string;
        stmt.invoiceUrl = invoice.hosted_invoice_url ?? stmt.invoiceUrl ?? null;
        stmt.invoicePdf =
          typeof invoice.invoice_pdf === 'string' ? invoice.invoice_pdf : null;
        await manager.getRepository(PaymentStatement).save(stmt);
      }

      // Create a failed transaction record (one per invoice)
      const amountDue =
        (typeof invoice.amount_due === 'number' ? invoice.amount_due : 0) ||
        (typeof invoice.amount_remaining === 'number'
          ? invoice.amount_remaining
          : 0);

      const tx = manager.getRepository(Transaction).create({
        referenceId: `inv_${invoice.id}`, // unique
        userId,
        type: PaymentType.Pay,
        status: TransactionStatus.Failed,
        gateway: PaymentGateway.Stripe,
        amount: amountDue,
        currency: invoice.currency || 'usd',
        stripeInvoiceId: invoice.id,
        metadata: JSON.stringify({
          attempt_count: (invoice as any).attempt_count ?? undefined,
          payment_intent: invoice.payment_intent ?? undefined,
          reason: failureReason,
        }),
      });

      await manager.getRepository(Transaction).save(tx);

      this.logger.log(
        `Recorded failed transaction ${tx.id} for user ${userId}, invoice ${invoice.id}`,
      );
    });
  }

  /**
   * Extract a readable reason for failure.
   * Attempts to expand PaymentIntent.last_payment_error if available.
   */
  private async extractFailureReason(
    invoice: Stripe.Invoice,
  ): Promise<string | null> {
    try {
      const piId =
        typeof invoice.payment_intent === 'string'
          ? invoice.payment_intent
          : null;
      if (!piId)
        return invoice.status_transitions?.marked_uncollectible_at
          ? 'Marked uncollectible'
          : 'Payment failed';

      const pi = await this.stripe.paymentIntents.retrieve(piId, {});

      const err = (pi as any)?.last_payment_error;
      if (!err) return 'Payment failed';

      const code = err.code ? `code=${err.code}` : '';
      const declineCode = err.decline_code
        ? `decline_code=${err.decline_code}`
        : '';
      const bankCode = err.payment_method?.sepa_debit?.bank_code
        ? `bank_code=${err.payment_method.sepa_debit.bank_code}`
        : '';
      const message = err.message || 'Payment attempt failed';

      return [message, code, declineCode, bankCode].filter(Boolean).join(' | ');
    } catch (e) {
      return 'Payment failed';
    }
  }
}
