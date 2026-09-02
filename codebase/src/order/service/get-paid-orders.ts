import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from '../entity/order.entity';
import { STRIPE_API_KEY } from 'src/config';
import * as uuid from 'uuid';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderStatus, SessionStatus } from 'src/enum';

@Injectable()
export class GetPaidOrderService {
  private stripe: Stripe;
  private readonly apiKey = STRIPE_API_KEY;
  private readonly logger = new Logger(GetPaidOrderService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {
    this.stripe = new Stripe(this.apiKey, { apiVersion: '2024-06-20' });
  }
  async execute() {
    try {
      const orders = await this.orderRepo.find({
        where: [{ status: 'shipped' }, { status: 'paid' }],
      });
      const sessions = await this.stripe.checkout.sessions.list({});

      const orderDiscrepancies = [];

      for (const order of orders) {
        const session = sessions.data.find((s) => {
          if (s.client_reference_id && uuid.validate(s.client_reference_id)) {
            return (
              s.client_reference_id.toLowerCase() ===
              order.referenceId.toLowerCase()
            );
          }
          return false;
        });

        if (session) {
          const paymentIntent = await this.stripe.paymentIntents.retrieve(
            session.payment_intent as string,
          );

          if (
            [
              OrderStatus.Paid as string,
              OrderStatus.Shipped as string,
            ].includes(order.status) &&
            paymentIntent.status !== SessionStatus.Succeeded
          ) {
            orderDiscrepancies.push(order);
          }
        } else {
          console.log(
            `No matching Stripe session found for order reference ID: ${order.referenceId}`,
          );
        }
      }

      return orderDiscrepancies;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
