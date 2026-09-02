import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PaymentGateway } from '../payment-gateway.interface';

@Injectable()
export class RetrieveCheckoutSessionService {
  private readonly logger = new Logger(RetrieveCheckoutSessionService.name);

  constructor(
    @Inject(forwardRef(() => 'PaymentGateway'))
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(
    sessionId: string,
    options?: { expand?: string[] },
  ): Promise<any> {
    try {
      return await this.paymentGateway.retrieveCheckoutSession(
        sessionId,
        options,
      );
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
