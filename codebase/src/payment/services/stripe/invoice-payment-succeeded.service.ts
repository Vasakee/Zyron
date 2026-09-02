import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { QueueService } from 'src/queues/services/queue.service';

@Injectable()
export class InvoicePaymentSucceededService {
  constructor(private readonly queueService: QueueService) {}

  async execute(invoice: Stripe.Invoice): Promise<void> {
    await this.queueService.addProcessInvoicePaymentJob({ invoice });
  }
}
