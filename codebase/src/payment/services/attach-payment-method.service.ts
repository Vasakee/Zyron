import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PaymentGateway } from '../payment-gateway.interface';

@Injectable()
export class AttachPaymentMethodService {
  private readonly logger = new Logger(AttachPaymentMethodService.name);

  constructor(
    @Inject(forwardRef(() => 'PaymentGateway'))
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(paymentMethodId: string, customerId: string): Promise<any> {
    try {
      return await this.paymentGateway.attachPaymentMethod(
        paymentMethodId,
        customerId,
      );
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
