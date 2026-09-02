import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueNames } from './types/queue.types';
import { QueueService } from './services/queue.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeCheckoutSession } from 'src/payment/entity/stripe-checkout-session.entity';
import { Transaction } from 'src/payment/entity/transaction.entity';
import { Kit } from 'src/kit/entity/kit.entity';
import { PractitionerKit } from 'src/kit/entity/practitioner-kits.entity';
import { User } from 'src/user/entity/user.entity';
import { Order } from 'src/order/entity/order.entity';

@Global()
@Module({
  imports: [
    BullModule.registerQueue(
      { name: QueueNames.TEST },
      { name: QueueNames.STRIPE },
      { name: QueueNames.HEALTH },
      { name: QueueNames.BILLING },
      { name: QueueNames.BILLING_ACCESS },
      { name: QueueNames.KIT },
      { name: QueueNames.MAIL },
    ),
    TypeOrmModule.forFeature([
      StripeCheckoutSession,
      Transaction,
      Kit,
      PractitionerKit,
      User,
      Order,
    ]),
  ],
  providers: [QueueService],
  exports: [QueueService, BullModule],
})
export class QueueCoreModule {}
