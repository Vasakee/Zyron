import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PaymentGateway } from '../payment-gateway.interface';

@Injectable()
export class GetPaymnetMethodService {
  constructor(
    @Inject(forwardRef(() => 'PaymentGateway'))
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(userId: string): Promise<any> {
    try {
      return this.paymentGateway.getPaymentMethod(userId);
    } catch (error) {
      throw error;
    }
  }
}
