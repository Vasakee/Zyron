import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PaymentGateway } from '../payment-gateway.interface';

@Injectable()
export class chargePaymentMethodService {
  constructor(
    @Inject(forwardRef(() => 'PaymentGateway'))
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(
    firstName: string,
    lastName: string,
    userId: string,
    kitType: string,
    paymentMethodId: string,
    country: string,
    quantity: number,
    referenceId?: string,
    isPreOrder?: boolean,
  ): Promise<any> {
    try {
      return this.paymentGateway.chargePaymentMethod(
        firstName,
        lastName,
        userId,
        kitType,
        paymentMethodId,
        country,
        quantity,
        referenceId,
        isPreOrder,
      );
    } catch (error) {
      throw error;
    }
  }
}
