import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { DashboardService } from './dashboard.service';
import { QueueNames } from 'src/queues/types/queue.types';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QueueNames.TEST },
      { name: QueueNames.STRIPE },
      { name: QueueNames.HEALTH },
      { name: QueueNames.BILLING },
      { name: QueueNames.BILLING_ACCESS },
      { name: QueueNames.KIT },
    ),
  ],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule { }
