import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PaymentGateway } from '../payment-gateway.interface';

@Injectable()
export class GetCheckoutSessions {
  constructor(
    @Inject(forwardRef(() => 'PaymentGateway'))
    private readonly paymentGateway: PaymentGateway,
  ) {}
  async execute(): Promise<any> {
    try {
      return this.paymentGateway.getAllCheckoutSessions();
    } catch (error) {
      throw error;
    }
  }
}
