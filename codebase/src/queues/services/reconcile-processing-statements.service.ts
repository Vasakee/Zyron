import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import Stripe from 'stripe';
import { DateTime } from 'luxon';

import { PaymentStatement } from 'src/payment/entity/payment-statement.entity';
import { User } from 'src/user/entity/user.entity';
import { STRIPE_API_KEY } from 'src/config';
import { PaymentStatementStatus } from 'src/enum';

@Injectable()
export class ReconcileProcessingStatementsService {
  private readonly logger = new Logger(
    ReconcileProcessingStatementsService.name,
  );
  private readonly stripe = new Stripe(STRIPE_API_KEY, {
    apiVersion: '2024-06-20',
  });

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async execute(
    maxAgeMinutes = 30,
    userGroupLimit = 200,
  ): Promise<{ groups: number }> {
    const groups = await this.dataSource
      .createQueryBuilder(PaymentStatement, 'ps')
      .select(['ps.userId AS userId', 'ps.periodEnd AS periodEnd'])
      .where('ps.status = :st', { st: PaymentStatementStatus.Processing })
      .andWhere('ps.updatedAt < DATEADD(minute, -:age, SYSUTCDATETIME())', {
        age: maxAgeMinutes,
      })
      .groupBy('ps.userId, ps.periodEnd')
      .orderBy('MIN(ps.createdAt)', 'ASC')
      .limit(userGroupLimit)
      .getRawMany<{ userId: string; periodEnd: string | Date }>();

    for (const g of groups) {
      const billDateISO = this.toDateOnly(g.periodEnd);
      if (!billDateISO) continue;

      try {
        await this.reconcileOneGroup(g.userId, billDateISO);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        this.logger.error(
          `Reconcile failed user=${g.userId} billDate=${billDateISO}: ${msg}`,
        );
      }
    }

    return { groups: groups.length };
  }

  async reconcileOneGroup(userId: string, billDateISO: string): Promise<void> {
    const statements = await this.dataSource
      .getRepository(PaymentStatement)
      .find({
        where: {
          userId,
          periodEnd: billDateISO as any,
          status: PaymentStatementStatus.Processing,
        },
        relations: ['user'],
        order: { createdAt: 'ASC', id: 'ASC' },
      });
    if (!statements.length) return;

    const user =
      statements[0].user ??
      (await this.dataSource
        .getRepository(User)
        .findOne({ where: { id: userId } }));
    if (!user) throw new Error(`User not found: ${userId}`);

    const invoice = await this.findInvoiceFor(user, billDateISO);

    if (invoice) {
      await this.applyInvoiceToDb(statements, invoice);
      this.logger.log(
        `Reconciled ${statements.length} statements → invoice ${invoice.id} (status=${invoice.status})`,
      );
      return;
    }

    await this.revertToOpen(statements);
    this.logger.warn(
      `No invoice found for user=${userId} billDate=${billDateISO}. Reverted ${statements.length} statements to Open.`,
    );
  }

  private async findInvoiceFor(
    user: User,
    billDateISO: string,
  ): Promise<Stripe.Invoice | null> {
    try {
      const query = `metadata['userId']:'${user.id}' AND metadata['billDate']:'${billDateISO}'`;
      const res = await this.stripe.invoices.search({ query, limit: 1 });
      if (res.data?.length) return res.data[0]!;
    } catch {}

    if (!user.stripeId) return null;
    const list = await this.stripe.invoices.list({
      customer: user.stripeId,
      limit: 50,
    });
    return (
      list.data.find(
        (inv) =>
          inv.metadata?.userId === user.id &&
          inv.metadata?.billDate === billDateISO,
      ) ?? null
    );
  }

  private async applyInvoiceToDb(
    statements: PaymentStatement[],
    invoice: Stripe.Invoice,
  ): Promise<void> {
    const ids = statements.map((s) => s.id);
    const isPaid = invoice.status === 'paid';

    await this.dataSource.transaction(async (m) => {
      await m
        .createQueryBuilder()
        .update(PaymentStatement)
        .set({
          invoiceId: invoice.id,
          invoiceNumber: invoice.number ?? null,
          invoiceUrl: invoice.hosted_invoice_url ?? null,
          invoicePdf:
            typeof invoice.invoice_pdf === 'string'
              ? invoice.invoice_pdf
              : null,
          invoiceStatus: invoice.status as string,
          status: isPaid
            ? PaymentStatementStatus.Paid
            : PaymentStatementStatus.Finalized,
          paidAt: isPaid
            ? invoice.status_transitions?.paid_at
              ? new Date(invoice.status_transitions.paid_at * 1000)
              : new Date()
            : null,
        })
        .where('id IN (:...ids)', { ids })
        .andWhere('status = :processing', {
          processing: PaymentStatementStatus.Processing,
        })
        .execute();
    });
  }

  private async revertToOpen(statements: PaymentStatement[]): Promise<void> {
    const ids = statements.map((s) => s.id);
    await this.dataSource
      .createQueryBuilder()
      .update(PaymentStatement)
      .set({ status: PaymentStatementStatus.Open })
      .where('id IN (:...ids)', { ids })
      .andWhere('status = :processing', {
        processing: PaymentStatementStatus.Processing,
      })
      .execute();
  }

  private toDateOnly(d: string | Date): string | null {
    if (!d) return null;
    const dt =
      d instanceof Date ? DateTime.fromJSDate(d) : DateTime.fromISO(String(d));
    return dt.isValid ? dt.toISODate() : null;
  }
}
