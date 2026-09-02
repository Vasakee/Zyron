import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PaymentGateway } from '../payment-gateway.interface';
import { FirstWaitlistCheckoutDto } from '../dto/checkout.dto';
import { Currency } from 'src/enum';

@Injectable()
export class ProcessFirstWaitlistPaymentService {
  constructor(
    @Inject(forwardRef(() => 'PaymentGateway'))
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(
    referenceId: string,
    data: FirstWaitlistCheckoutDto,
  ): Promise<any> {
    try {
      return this.paymentGateway.processFirstWaitlistPayment(
        referenceId,
        data.currency,
        data.firstName,
        data.lastName,
        data.email,
        data.quantity,
      );
    } catch (error) {
      throw error;
    }
  }
}
