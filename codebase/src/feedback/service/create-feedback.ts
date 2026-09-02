import { Injectable, Logger } from '@nestjs/common';
import { Feedback } from '../entity/feedback.entity';
import { CreateFeedbackDto } from '../dto/feedback.dto';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { STRIPE_API_KEY } from 'src/config';
import Stripe from 'stripe';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FeedbackCodeEvent } from 'src/helper/events/feedback-code';
import { Source } from 'src/enum';

@Injectable()
export class CreateFeedbackService {
  private stripe: Stripe;
  private readonly apiKey = STRIPE_API_KEY;
  private readonly logger = new Logger(CreateFeedbackService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Feedback)
    private readonly feedbackRepo: Repository<Feedback>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.stripe = new Stripe(this.apiKey, { apiVersion: '2024-06-20' });
  }
  async execute(data: CreateFeedbackDto) {
    try {
      const sessionId = data.sessionId;

      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      const customerDetails = session.customer_details;

      const code = await this.stripe.promotionCodes.create({
        coupon: 'FEEDBACK10',
        max_redemptions: 1,
      });
      data.name = customerDetails?.name;
      data.email = customerDetails?.email;
      const Dto = new CreateFeedbackDto();
      data.code = code.code;
      const payload = Dto.toEntity(data);
      const result = await this.feedbackRepo.save(payload);

      if (data.source === Source.Website) {
        const mailData: FeedbackCodeEvent = {
          name: customerDetails?.name,
          code: code.code,
          email: customerDetails?.email,
        };

        this.eventEmitter.emit('send.discount', mailData);
      }

      this.logger.log(`Sent to ${customerDetails.email}, ${code}`);
      return Dto.fromEntity(result);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
