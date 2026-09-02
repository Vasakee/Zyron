import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PaymentGateway } from '../payment-gateway.interface';

@Injectable()
export class UpdateShippingService {
  constructor(
    @Inject(forwardRef(() => 'PaymentGateway'))
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(): Promise<any> {
    try {
      this.paymentGateway.updateShipping();
    } catch (error) {
      throw error;
    }
  }
}
