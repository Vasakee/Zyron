import { Injectable, Logger } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import Stripe from 'stripe';
import { PaymentStatement } from 'src/payment/entity/payment-statement.entity';
import { PaymentStatementStatus } from 'src/enum';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class StripeInvoiceFinalizationFailedService {
  private readonly logger = new Logger(
    StripeInvoiceFinalizationFailedService.name,
  );

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async execute(invoice: Stripe.Invoice): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      let statements = await manager.getRepository(PaymentStatement).find({
        where: { invoiceId: invoice.id },
      });

      if (!statements.length) {
        const metaIds = this.parseIdsFromMetadata(
          invoice?.metadata?.paymentStatementIds,
        );
        if (metaIds.length) {
          statements = await manager.getRepository(PaymentStatement).find({
            where: { id: In(metaIds) },
          });
        }
      }

      if (!statements.length) {
        this.logger.warn(
          `invoice.finalization_failed: no PaymentStatements found for invoice ${invoice.id} (checked invoiceId and metadata.paymentStatementIds).`,
        );
        return;
      }

      const reason = this.humanizeFinalizeError(invoice);

      for (const stmt of statements) {
        stmt.invoiceId = invoice.id;
        stmt.invoiceNumber = invoice.number || stmt.invoiceNumber;
        stmt.invoiceStatus = invoice.status as string; // likely 'draft'
        stmt.invoiceUrl = null;
        stmt.invoicePdf = null;

        stmt.failureReason = reason;

        stmt.status = PaymentStatementStatus.Open;

        await manager.getRepository(PaymentStatement).save(stmt);
      }

      this.logger.error(
        `invoice.finalization_failed handled for ${invoice.id} — updated ${statements.length} statement(s): ${reason}`,
      );
    });
  }

  private parseIdsFromMetadata(raw?: string): string[] {
    if (!raw) return [];
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  private humanizeFinalizeError(inv: Stripe.Invoice): string {
    const err = (inv as any)?.last_finalization_error;
    if (!err) return 'Invoice finalization failed (unknown reason).';
    const parts = [
      err.message || 'Finalization error',
      err.code ? `code=${err.code}` : '',
      err.param ? `param=${err.param}` : '',
      err.type ? `type=${err.type}` : '',
    ].filter(Boolean);
    return parts.join(' | ');
  }
}
