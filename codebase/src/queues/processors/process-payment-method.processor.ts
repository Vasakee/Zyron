import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  QueueNames,
  JobTypes,
  ProcessPaymentMethodJobData,
} from '../types/queue.types';
import { PaymentGateway, PaymentMethodType } from 'src/enum';
import { PaymentMethod } from 'src/payment/entity/payment-method.entity';
import { RetrievePaymentMethodService } from 'src/payment/services/retrieve-payment-method.service';
import { AttachPaymentMethodService } from 'src/payment/services/attach-payment-method.service';
import { isUUID } from 'src/common/utils/validation';

@Processor(QueueNames.STRIPE)
export class ProcessPaymentMethodProcessor {
  private readonly logger = new Logger(ProcessPaymentMethodProcessor.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly retrievePaymentMethodService: RetrievePaymentMethodService,
    private readonly attachPaymentMethodService: AttachPaymentMethodService,
  ) {}

  @Process(JobTypes.PROCESS_PAYMENT_METHOD)
  async processPaymentMethod(
    job: Job<ProcessPaymentMethodJobData>,
  ): Promise<void> {
    const { paymentMethodId, userId, stripeCustomerId } = job.data;

    this.logger.log(
      `Processing payment method for session ${job.data.sessionId}`,
    );

    try {
      await this.dataSource.transaction(async (manager) => {
        if (!isUUID(userId)) {
          this.logger.warn(
            `Skipping payment method processing: invalid userId "${userId}" for session ${job.data.sessionId}`,
          );
          return;
        }

        const paymentMethod = await this.retrievePaymentMethodService.execute(
          paymentMethodId,
        );

        if (paymentMethod.type !== PaymentMethodType.Card) {
          this.logger.warn(
            `Non-card payment method type: ${paymentMethod.type}`,
          );
          return;
        }

        const userPaymentMethods = await manager.find(PaymentMethod, {
          where: { userId },
          order: { createdAt: 'DESC' },
        });

        const userPaymentMethodIds = userPaymentMethods.map(
          (eq) => eq.providerId,
        );

        if (!userPaymentMethodIds.includes(paymentMethod.id)) {
          // Remove excess payment methods (keep only 2)
          if (userPaymentMethods.length > 2) {
            const excessMethods = userPaymentMethods.slice(2);
            for (const method of excessMethods) {
              await manager.remove(PaymentMethod, method);
            }
          }

          // Update current default method
          const currentDefaultMethod = await manager.findOne(PaymentMethod, {
            where: { userId, isDefault: true },
          });

          if (currentDefaultMethod) {
            await manager.update(
              PaymentMethod,
              { id: currentDefaultMethod.id },
              { isDefault: false },
            );
          }

          // Save new payment method
          await manager.save(PaymentMethod, {
            userId,
            providerId: paymentMethod.id,
            provider: PaymentGateway.Stripe,
            type: paymentMethod.type,
            isDefault: true,
            metadata: JSON.stringify({
              name: paymentMethod.billing_details.name,
              brand: paymentMethod.card.brand,
              last_four: paymentMethod.card.last4,
              exp_month: paymentMethod.card.exp_month,
              exp_year: paymentMethod.card.exp_year,
            }),
          });

          // Attach to Stripe customer
          await this.attachPaymentMethodService.execute(
            paymentMethod.id,
            stripeCustomerId,
          );

          this.logger.log(`Payment method saved for user ${userId}`);
        } else {
          this.logger.log(`Payment method already exists for user ${userId}`);
        }
      });

      this.logger.log(
        `Successfully processed payment method for session ${job.data.sessionId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process payment method for session ${job.data.sessionId}`,
        error,
      );
      throw error;
    }
  }
}
