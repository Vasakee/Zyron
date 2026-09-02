import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { STRIPE_API_KEY } from 'src/config';
import { Session } from './types/session';
import { Order } from 'src/order/entity/order.entity';

@Injectable()
export class StripePromotionCodeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2024-06-20' });
  }

  async handlePromotionCodes(session: Session) {
    if ((session as any)?.discounts.length > 0) {
      const discount = (session as any).discounts[0] as Stripe.Discount;
      const promotionCodeId =
        typeof discount.promotion_code === 'string'
          ? discount.promotion_code
          : discount.promotion_code.id;

      const promotionCode = await this.stripe.promotionCodes.retrieve(
        promotionCodeId,
      );

      return {
        promotionCode: promotionCode.code,
        promotionCodeId: promotionCode.id,
      };
    }

    if (
      session.total_details?.breakdown?.discounts &&
      session.total_details.breakdown.discounts.length > 0
    ) {
      const firstDiscount = session.total_details.breakdown.discounts[0];

      // Check if the discount has a promotion code
      if (firstDiscount.discount?.promotion_code) {
        const promotionCodeId =
          typeof firstDiscount.discount.promotion_code === 'string'
            ? firstDiscount.discount.promotion_code
            : firstDiscount.discount.promotion_code.id;

        const promotionCode = await this.stripe.promotionCodes.retrieve(
          promotionCodeId,
        );

        return {
          promotionCode: promotionCode.code,
          promotionCodeId: promotionCode.id,
        };
      }
    }

    return {
      promotionCode: null,
      promotionCodeId: null,
    };
  }

  async handlePromotionCodesForNewOrder(session: Session, order: Order) {
    try {
      // Check if session has discounts applied
      if (
        session.total_details?.breakdown?.discounts &&
        session.total_details.breakdown.discounts.length > 0
      ) {
        const firstDiscount = session.total_details.breakdown.discounts[0];

        // Check if the discount has a promotion code
        if (firstDiscount.discount?.promotion_code) {
          const promotionCodeId =
            typeof firstDiscount.discount.promotion_code === 'string'
              ? firstDiscount.discount.promotion_code
              : firstDiscount.discount.promotion_code.id;

          const promotionCode = await this.stripe.promotionCodes.retrieve(
            promotionCodeId,
          );

          // Update order with promotion code information
          order.promotionCode = promotionCode.code;
          order.promotionCodeId = promotionCode.id;
        }
      }
    } catch (error) {
      console.error('Error handling promotion codes for new order:', error);
      // Don't throw error as this is not critical for payment processing
    }
  }
}
