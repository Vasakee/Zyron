import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PaymentGateway } from '../payment-gateway.interface';

@Injectable()
export class PaymentWebhookService {
  constructor(
    @Inject(forwardRef(() => 'PaymentGateway'))
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(data: any, signature: string): Promise<any> {
    try {
      return this.paymentGateway.paymentWebhook(data, signature);
    } catch (error) {
      throw error;
    }
  }
}
