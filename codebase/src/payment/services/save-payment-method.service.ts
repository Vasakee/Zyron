import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PaymentGateway } from '../payment-gateway.interface';

@Injectable()
export class SavePaymentMethodService {
  private readonly logger = new Logger(SavePaymentMethodService.name);

  constructor(
    @Inject(forwardRef(() => 'PaymentGateway'))
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(sessionId: string): Promise<{ message: string }> {
    try {
      return await this.paymentGateway.savePaymentMethod(sessionId);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
