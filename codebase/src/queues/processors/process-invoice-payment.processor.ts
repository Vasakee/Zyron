import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Job } from 'bull';
import Stripe from 'stripe';
import { DateTime } from 'luxon';
import { DataSource, In } from 'typeorm';
import {
  QueueNames,
  JobTypes,
  ProcessInvoicePaymentJobData,
} from '../types/queue.types';
import { PaymentStatement } from 'src/payment/entity/payment-statement.entity';
import { Order } from 'src/order/entity/order.entity';
import { Transaction } from 'src/payment/entity/transaction.entity';
import { User } from 'src/user/entity/user.entity';
import {
  PaymentStatementStatus,
  OrderStatus,
  TransactionStatus,
  PaymentGateway,
  PaymentType,
} from 'src/enum';
import {
  InvoicePaidPayload,
  InvoicePaidListener,
} from 'src/helper/listeners/invoice-paid';

@Injectable()
@Processor(QueueNames.BILLING)
export class ProcessInvoicePaymentProcessor {
  private readonly logger = new Logger(ProcessInvoicePaymentProcessor.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly invoicePaidService: InvoicePaidListener,
  ) {}

  @Process(JobTypes.PROCESS_INVOICE_PAYMENT)
  async processInvoicePayment(job: Job<ProcessInvoicePaymentJobData>) {
    const { invoice } = job.data;

    try {
      this.logger.log(
        `Processing invoice payment job for invoice ${invoice.id}`,
      );

      const userInfo = await this.handleInvoicePayment(invoice);

      if (userInfo && invoice.status === 'paid') {
        const paidAtSec =
          typeof invoice.status_transitions?.paid_at === 'number'
            ? invoice.status_transitions.paid_at
            : undefined;
        const paidAt = paidAtSec ? new Date(paidAtSec * 1000) : new Date();

        const payload: InvoicePaidPayload = {
          userId: userInfo.id,
          invoiceId: invoice.id,
          invoiceNumber: invoice.number || undefined,
          invoicePdf:
            typeof invoice.invoice_pdf === 'string'
              ? invoice.invoice_pdf
              : undefined,
          clientName:
            [userInfo.firstName, userInfo.lastName].filter(Boolean).join(' ') ||
            'Customer',
          clientEmail: userInfo.email || '',
          totalAmount:
            typeof invoice.amount_paid === 'number'
              ? invoice.amount_paid
              : typeof invoice.total === 'number'
              ? invoice.total
              : 0,
          currency: invoice.currency || 'usd',
          paidAt,
        };

        await this.invoicePaidService.handle(payload);

        this.logger.log(
          `Completed invoice payment follow-up for invoice ${invoice.id} (user ${userInfo.id})`,
        );
      }

      this.logger.log(
        `Successfully processed invoice payment for invoice ${invoice.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process invoice payment for invoice ${invoice.id}:`,
        error,
      );
      throw error;
    }
  }

  private async handleInvoicePayment(
    invoice: Stripe.Invoice,
  ): Promise<User | null> {
    let userInfo: User | null = null;

    await this.dataSource.transaction(async (manager) => {
      const statements = await manager.getRepository(PaymentStatement).find({
        where: { invoiceId: invoice.id },
        relations: ['user'],
      });

      if (statements.length === 0) {
        this.logger.warn(
          `No payment statements found for invoice ${invoice.id}`,
        );
        return;
      }

      const paidAt = DateTime.now().toJSDate();
      const userId = statements[0].userId;

      userInfo = statements[0].user;

      const amountPaid =
        typeof invoice.amount_paid === 'number' ? invoice.amount_paid : 0;
      const amountRemaining =
        typeof invoice.amount_remaining === 'number'
          ? invoice.amount_remaining
          : 0;
      const fullyPaid = amountRemaining === 0;

      const referenceId = `inv_${invoice.id}`;
      let tx = await manager
        .getRepository(Transaction)
        .findOne({ where: { referenceId } });

      if (!tx) {
        tx = manager.getRepository(Transaction).create({
          referenceId,
          userId,
          type: PaymentType.Pay,
          status: TransactionStatus.Successful,
          gateway: PaymentGateway.Stripe,
          amount: amountPaid,
          currency: invoice.currency || 'usd',
          stripeInvoiceId: invoice.id,
          paymentIntentId:
            typeof invoice.payment_intent === 'string'
              ? invoice.payment_intent
              : null,
          paidAt,
          metadata: JSON.stringify({
            hosted_invoice_url: invoice.hosted_invoice_url,
            invoice_pdf: invoice.invoice_pdf,
            attempt_count: (invoice as any).attempt_count ?? undefined,
          }),
        });
      } else {
        tx.status = TransactionStatus.Successful;
        tx.amount = amountPaid;
        tx.currency = invoice.currency || tx.currency || 'usd';
        tx.paidAt = paidAt;
        tx.paymentIntentId =
          typeof invoice.payment_intent === 'string'
            ? invoice.payment_intent
            : tx.paymentIntentId;
        tx.metadata = JSON.stringify({
          ...(tx.metadata ? safeParseJson(tx.metadata) : {}),
          hosted_invoice_url: invoice.hosted_invoice_url,
          invoice_pdf: invoice.invoice_pdf,
          attempt_count: (invoice as any).attempt_count ?? undefined,
        });
      }
      await manager.getRepository(Transaction).save(tx);

      for (const statement of statements) {
        statement.invoiceStatus = invoice.status as string;
        statement.invoiceUrl =
          invoice.hosted_invoice_url ?? statement.invoiceUrl ?? null;
        statement.invoicePdf =
          typeof invoice.invoice_pdf === 'string'
            ? invoice.invoice_pdf
            : statement.invoicePdf ?? null;
        statement.invoiceNumber = invoice.number || statement.invoiceNumber;

        if (fullyPaid) {
          statement.status = PaymentStatementStatus.Paid;
          statement.paidAt = paidAt;
        }

        await manager.getRepository(PaymentStatement).save(statement);
      }

      // Get all order IDs associated with this invoice via payment statement items
      const statementIds = statements.map((s) => s.id);
      const orderIds = await manager
        .createQueryBuilder()
        .select('psi.orderId', 'orderId')
        .from('payment_statement_items', 'psi')
        .where('psi.paymentStatementId IN (:...statementIds)', {
          statementIds,
        })
        .getRawMany();

      const orderIdsList = Array.from(new Set(orderIds.map((r) => r.orderId)));

      if (orderIdsList.length > 0) {
        await manager.getRepository(Order).update(
          { id: In(orderIdsList), userId },
          {
            status: OrderStatus.Paid,
            completedAt: paidAt,
            currency: invoice.currency,
            invoiceId: invoice.id,
            invoiceNumber: invoice.number,
            amountSubtotal: invoice.subtotal || 0,
            amountTotal: invoice.total || 0,
            amountTax: Math.abs(
              invoice.total_tax_amounts?.reduce(
                (sum, tax) => sum + tax.amount,
                0,
              ) ||
                invoice.tax ||
                0,
            ),
            amountDiscount: Math.abs(
              invoice.total_discount_amounts?.reduce(
                (sum, discount) => sum + discount.amount,
                0,
              ) || 0,
            ),
            promotionCode: invoice.discount?.coupon?.name || undefined,
            promotionCodeId:
              invoice.discount?.promotion_code.toString() || undefined,
            updatedAt: new Date(),
          },
        );
      }

      this.logger.log(
        `Processed invoice.payment_succeeded for invoice ${invoice.id}: user=${userId} statements=${statements.length} fullyPaid=${fullyPaid}`,
      );
    });

    return userInfo;
  }
}

function safeParseJson(s?: string | null): Record<string, any> {
  if (!s) return {};
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}
