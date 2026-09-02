import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PaymentGateway } from '../payment-gateway.interface';

@Injectable()
export class RetrievePaymentMethodService {
  private readonly logger = new Logger(RetrievePaymentMethodService.name);

  constructor(
    @Inject(forwardRef(() => 'PaymentGateway'))
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(paymentMethodId: string): Promise<any> {
    try {
      return await this.paymentGateway.retrievePaymentMethod(paymentMethodId);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
