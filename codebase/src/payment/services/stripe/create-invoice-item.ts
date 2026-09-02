import Stripe from 'stripe';
import { STRIPE_API_KEY } from 'src/config';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import { NotFoundErrorException } from 'src/common';
import { StripeGetOrCreateCustomerByEmail } from './get-or-create-customer-by-email';

@Injectable()
export class StripeCreateInvoiceItem {
  private stripe: Stripe;

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly stripeGetOrCreateCustomerByEmail: StripeGetOrCreateCustomerByEmail,
  ) {
    this.stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2024-06-20' });
  }

  async execute(
    userId: string,
    orderReferenceId: string,
    unit_amount: number,
    currency: string,
    kitType: string,
    quantity: number,
    country: string,
    description: string,
  ): Promise<Stripe.InvoiceItem> {
    const user = await this.dataSource
      .getRepository(User)
      .findOne({ where: { id: userId } });
    if (!user) throw new NotFoundErrorException('User not found');

    let customerId = user.stripeId;
    const clientName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(' ');
    const clientEmail = user.email;

    if (!customerId) {
      const customer = await this.stripeGetOrCreateCustomerByEmail.execute(
        clientEmail,
        clientName,
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

    const params: Stripe.InvoiceItemCreateParams = {
      customer: user.stripeId,
      amount: unit_amount * quantity,
      currency: currency,
      description,
      metadata: {
        orderReferenceId,
        kitType,
        quantity: String(quantity),
        country,
        clientName,
        clientEmail,
      },
    };

    return this.stripe.invoiceItems.create(params);
  }
}
