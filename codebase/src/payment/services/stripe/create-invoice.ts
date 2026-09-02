import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import Stripe from 'stripe';
import { DateTime } from 'luxon';

import { PaymentStatement } from 'src/payment/entity/payment-statement.entity';
import { User } from 'src/user/entity/user.entity';
import { STRIPE_API_KEY, SYSTEM_TIME_ZONE } from 'src/config';
import { StripeGetOrCreateCustomerByEmail } from './get-or-create-customer-by-email';

@Injectable()
export class StripeCreateInvoice {
  private readonly logger = new Logger(StripeCreateInvoice.name);
  private readonly stripe: Stripe;

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly stripeGetOrCreateCustomerByEmail: StripeGetOrCreateCustomerByEmail,
  ) {
    this.stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2024-06-20' });
  }

  async execute(
    paymentStatement: PaymentStatement,
    additionalStatements: PaymentStatement[] = [],
    opts?: { idempotencyKey?: string },
  ): Promise<Stripe.Response<Stripe.Invoice>> {
    const allStatements = [paymentStatement, ...additionalStatements];

    const userRepo = this.dataSource.getRepository(User);

    const user = await userRepo.findOne({
      where: { id: paymentStatement.userId },
    });

    if (!user) {
      throw new Error(`User not found for ID ${paymentStatement.userId}`);
    }

    let customerId = user.stripeId;
    if (!customerId) {
      const customer = await this.stripeGetOrCreateCustomerByEmail.execute(
        user.email || undefined,
        [user.firstName, user.lastName].filter(Boolean).join(' ') || undefined,
        { metadata: { userId: user.id } },
      );
      customerId = customer.id;

      await this.dataSource
        .createQueryBuilder()
        .update(User)
        .set({ stripeId: customerId })
        .where('id = :id', { id: user.id })
        .execute();
    }

    const BUSINESS_TZ = SYSTEM_TIME_ZONE || 'America/New_York';
    const billDateISO =
      this.toDateOnly(paymentStatement.periodEnd, BUSINESS_TZ) ||
      DateTime.now().setZone(BUSINESS_TZ).toISODate();

    const invKey =
      opts?.idempotencyKey ??
      `invoice:${user.id}:${paymentStatement.id}:${billDateISO}`;
    const billingRunId = `br:${user.id}:${billDateISO}`;

    const draft = await this.stripe.invoices.create(
      {
        customer: customerId,
        collection_method: 'charge_automatically',
        currency: paymentStatement.currency,
        auto_advance: true,
        pending_invoice_items_behavior: 'exclude',
        metadata: {
          billDate: billDateISO,
          billingRunId,
          userId: user.id,
          paymentStatementIds: allStatements.map((s) => s.id).join(','),
          statementCount: String(allStatements.length),
          clientName:
            [user.firstName, user.lastName].filter(Boolean).join(' ') || 'N/A',
          clientEmail: user.email || 'N/A',
        },
      },
      { idempotencyKey: `${invKey}:create` },
    );

    let totalItemCount = 0;

    for (const stmt of allStatements) {
      if (!stmt?.items?.length) continue;

      const { startUtc, endUtc } = this.statementPeriodToUtcSeconds(
        stmt,
        BUSINESS_TZ,
      );

      for (const it of stmt.items) {
        const amount = Number(it.unitAmount);
        if (!Number.isFinite(amount) || amount <= 0) continue;

        const dt = DateTime.fromJSDate(it.createdAt).setZone(
          SYSTEM_TIME_ZONE || 'America/New_York',
        );
        const formatted = dt.toFormat('yyyy-LL-dd hh:mm a ZZZZ');

        await this.stripe.invoiceItems.create(
          {
            customer: customerId,
            invoice: draft.id,
            currency: it.currency,
            amount: amount * (it.quantity || 1),
            description: it.description || undefined,
            period: { start: startUtc, end: endUtc },
            metadata: {
              payment_statement_item_id: it.id,
              payment_statement_id: stmt.id,
              user_id: user.id,
              billDate: billDateISO,
              billingRunId,
              createdAt: formatted,
            },
          },
          { idempotencyKey: `ii:${it.id}` },
        );

        totalItemCount += 1;
      }
    }

    if (totalItemCount === 0) {
      this.logger.warn(
        `No invoice items for user ${user.id} on ${billDateISO}; skipping invoice creation.`,
      );
      throw new Error('No invoice items to bill.');
    }

    const finalized = await this.stripe.invoices.finalizeInvoice(
      draft.id,
      undefined,
      { idempotencyKey: `${invKey}:finalize` },
    );

    this.logger.log(
      `Created & finalized invoice ${finalized.id} for user ${user.id} (billDate=${billDateISO}, items=${totalItemCount})`,
    );

    return finalized;
  }

  private statementPeriodToUtcSeconds(
    stmt: Pick<PaymentStatement, 'periodStart' | 'periodEnd'>,
    businessTz: string,
  ): { startUtc: number; endUtc: number } {
    const startLocal = this.toDateTime(stmt.periodStart, businessTz)?.startOf(
      'day',
    );
    const endLocal = this.toDateTime(stmt.periodEnd, businessTz)?.endOf('day');

    if (!startLocal || !endLocal) {
      throw new Error(
        `Invalid statement dates: start=${stmt.periodStart} end=${stmt.periodEnd}`,
      );
    }

    return {
      startUtc: startLocal.toUTC().toUnixInteger(),
      endUtc: endLocal.toUTC().toUnixInteger(),
    };
  }

  private toDateTime(date: Date | string, zone: string): DateTime | null {
    if (!date) return null;
    const dt =
      date instanceof Date
        ? DateTime.fromJSDate(date, { zone })
        : DateTime.fromISO(String(date), { zone });
    return dt.isValid ? dt : null;
  }

  private toDateOnly(date: Date | string, zone: string): string | null {
    const dt = this.toDateTime(date, zone);
    return dt?.toISODate() ?? null;
  }
}
