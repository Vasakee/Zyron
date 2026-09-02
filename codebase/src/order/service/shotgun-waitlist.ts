import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entity/order.entity';
import { ShotgunWaitlist } from '../entity/shotgun-waitlist.entity';
import { ShotgunWaitlistDto } from '../dto/shotgun-waitlist.dto';
import * as uuid from 'uuid';
import { User } from 'src/user/entity/user.entity';
import { ProcessFirstWaitlistPaymentService } from 'src/payment/services/process-first-waitlist-payment';

@Injectable()
export class ShotgunWaitlistService {
  private readonly logger = new Logger(ShotgunWaitlistService.name);

  constructor(
    @InjectRepository(ShotgunWaitlist)
    private readonly shotgunRepo: Repository<ShotgunWaitlist>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly processFirstWaitlistPaymentService: ProcessFirstWaitlistPaymentService,
  ) {}

  async execute(data: ShotgunWaitlistDto) {
    try {
      const referenceId = uuid.v4();

      data.referenceId = referenceId;

      const userRecord = await this.userRepo.findOne({
        where: { email: data.email },
      });

      if (userRecord) {
        data.userId = userRecord.id;
      }

      const waitlistDto = new ShotgunWaitlistDto();

      const waitlistPayload = waitlistDto.toEntity(data);

      const orderPayload = waitlistDto.toOrderEntity(data);

      const [waitlistEntry, savedOrder, session] = await Promise.all([
        this.shotgunRepo.save(waitlistPayload),
        this.orderRepo.save(orderPayload),
        this.processFirstWaitlistPaymentService.execute(referenceId, {
          currency: data.currency,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          quantity: data.quantity,
        }),
      ]);

      return {
        waitlistId: waitlistEntry.id,
        orderId: savedOrder.id,
        ...session,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
