import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { QueueNames } from 'src/queues/types/queue.types';

@Injectable()
export class DashboardService {
  private serverAdapter: ExpressAdapter;

  constructor(
    @InjectQueue(QueueNames.TEST) private testQueue: Queue,
    @InjectQueue(QueueNames.STRIPE) private stripeQueue: Queue,
    @InjectQueue(QueueNames.HEALTH) private healthQueue: Queue,
    @InjectQueue(QueueNames.BILLING) private billingQueue: Queue,
    @InjectQueue(QueueNames.BILLING_ACCESS) private billingAccessQueue: Queue,
    @InjectQueue(QueueNames.KIT) private kitQueue: Queue,
  ) {
    this.setupBullBoard();
  }

  private setupBullBoard() {
    this.serverAdapter = new ExpressAdapter();
    this.serverAdapter.setBasePath('/v1/admin/queues');

    createBullBoard({
      queues: [
        new BullAdapter(this.testQueue),
        new BullAdapter(this.stripeQueue),
        new BullAdapter(this.healthQueue),
        new BullAdapter(this.billingQueue),
        new BullAdapter(this.billingAccessQueue),
        new BullAdapter(this.kitQueue),
      ],
      serverAdapter: this.serverAdapter,
    });
  }

  getRouter() {
    return this.serverAdapter.getRouter();
  }
}
