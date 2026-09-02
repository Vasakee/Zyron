import { Injectable } from '@nestjs/common';
import { PaymentMethod } from '../../entity/payment-method.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class StripeGetPaymentMethod {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  async execute(userId: string) {
    try {
      console.log(userId);
      const paymentMethods = await this.paymentMethodRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 3,
      });

      return paymentMethods.map((method) => ({
        id: method.id,
        isDefault: method.isDefault,
        paymentId: method.providerId,
        cardType: JSON.parse(method.metadata).brand,
        lastFour: JSON.parse(method.metadata).last_four,
        expirationDate: `${JSON.parse(method.metadata).exp_month}/${
          JSON.parse(method.metadata).exp_year
        }`,
      }));
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }
}
