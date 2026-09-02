import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PaymentGateway } from '../payment-gateway.interface';
import { SecondWaitlistCheckoutDto } from '../dto/checkout.dto';

@Injectable()
export class ProcessSecondWaitlistPaymentService {
  constructor(
    @Inject(forwardRef(() => 'PaymentGateway'))
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(
    referenceId: string,
    data: SecondWaitlistCheckoutDto,
  ): Promise<any> {
    try {
      return this.paymentGateway.processSecondWaitlistPayment(
        referenceId,
        data.initialReferenceId,
        data.quantity,
      );
    } catch (error) {
      throw error;
    }
  }
}
