import { Injectable, Logger } from '@nestjs/common';
import { ConsentAcceptanceDto } from '../dto/create-order.dto';
import { PaymentMethodType } from 'src/enum';
import { BadRequestErrorException } from 'src/common';
import { RetrieveCheckoutSessionService } from 'src/payment/services/retrieve-checkout-session.service';
import { RetrievePaymentMethodService } from 'src/payment/services/retrieve-payment-method.service';
import { QueueService } from 'src/queues/services/queue.service';

@Injectable()
export class ConsentAcceptanceService {
  private readonly logger = new Logger(ConsentAcceptanceService.name);

  constructor(
    private readonly retrieveCheckoutSessionService: RetrieveCheckoutSessionService,
    private readonly retrievePaymentMethodService: RetrievePaymentMethodService,
    private readonly queueService: QueueService,
  ) {}

  async execute(data: ConsentAcceptanceDto) {
    try {
      const session = await this.retrieveCheckoutSessionService.execute(
        data.session_id,
        { expand: ['payment_intent'] },
      );

      if (!session || !session.payment_intent) {
        throw new BadRequestErrorException('Invalid session or payment intent');
      }

      const paymentIntent = session.payment_intent as any;
      const paymentMethodId = paymentIntent.payment_method as string;

      if (!paymentMethodId) {
        throw new BadRequestErrorException('No payment method found');
      }

      const paymentMethod = await this.retrievePaymentMethodService.execute(
        paymentMethodId,
      );

      if (paymentMethod.type !== PaymentMethodType.Card) {
        throw new BadRequestErrorException(
          'Only card payment methods are supported',
        );
      }

      const referenceId = session.client_reference_id;
      if (!referenceId) {
        throw new BadRequestErrorException('No reference ID found in session');
      }

      // Queue the payment method processing for proper handling with retries
      await this.queueService.addProcessPaymentMethodJob({
        sessionId: data.session_id,
        paymentMethodId,
        referenceId,
        userId: session.metadata?.userId || '',
        stripeCustomerId: session.customer as string,
      });

      this.logger.log(
        `Payment method processing queued for session ${data.session_id}`,
      );

      return { message: 'Payment method processing initiated successfully' };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
