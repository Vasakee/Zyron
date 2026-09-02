import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  BadRequestErrorException,
  NotFoundErrorException,
} from 'src/common';
import { PractitionerKit } from '../entity/practitioner-kits.entity';
import { OrderKit } from 'src/order/entity/order-kit.entity';
import { HealthInformationDispatchLog } from 'src/health-info/entity/health-information-dispatch-log.entity';
import { DispatchStatus } from 'src/enum';
import { QueueService } from 'src/queues/services/queue.service';
import { RegisterPractitionerKitDto } from '../dto/register-practitioner-kit.dto';

@Injectable()
export class EnqueueHealthInfoDispatchService {
  private readonly logger = new Logger(EnqueueHealthInfoDispatchService.name);

  constructor(
    @InjectRepository(PractitionerKit)
    private readonly practitionerKitRepo: Repository<PractitionerKit>,
    @InjectRepository(OrderKit)
    private readonly orderKitRepo: Repository<OrderKit>,
    private readonly queueService: QueueService,
    private readonly dataSource: DataSource,
  ) {}

  async execute(practitionerKitId: string) {
    try {
      const practitionerKit = await this.practitionerKitRepo.findOne({
        where: { id: practitionerKitId },
      });

      if (!practitionerKit) {
        throw new NotFoundErrorException('Practitioner kit not found');
      }

      const orderKit = await this.orderKitRepo.findOne({
        where: { kitId: practitionerKit.kitNumber },
        relations: ['order'],
        order: { createdAt: 'DESC' },
      });

      if (!orderKit?.order) {
        throw new NotFoundErrorException('Order not found for practitioner kit');
      }

      if (!orderKit.order.email) {
        throw new BadRequestErrorException(
          'Order is missing recipient email',
        );
      }

      if (!orderKit.order.userId) {
        throw new BadRequestErrorException(
          'Order is missing practitioner reference',
        );
      }

      const logId = await this.dataSource.transaction(async (manager) => {
        const existingLog = await manager.findOne(
          HealthInformationDispatchLog,
          {
            where: {
              orderId: orderKit.order.id,
              kitId: practitionerKit.kitNumber,
            },
          },
        );

        const rows = (await manager.query(
          `
            SELECT SYSUTCDATETIME() AS nowUtc;
          `,
        )) as Array<{ nowUtc: string }>;
        const registeredAt = new Date(rows[0].nowUtc);

        if (existingLog) {
          existingLog.practitionerId = orderKit.order.userId;
          existingLog.recipientEmail = orderKit.order.email;
          existingLog.status = DispatchStatus.QUEUED;
          existingLog.attempts = 0;
          existingLog.lastAttemptedAt = null;
          existingLog.lastError = null;
          existingLog.registeredAt = registeredAt;

          await manager.save(HealthInformationDispatchLog, existingLog);
          return existingLog.id;
        }

        const log = manager.create(HealthInformationDispatchLog, {
          orderId: orderKit.order.id,
          kitId: practitionerKit.kitNumber,
          practitionerId: orderKit.order.userId,
          recipientEmail: orderKit.order.email,
          status: DispatchStatus.QUEUED,
          attempts: 0,
          lastAttemptedAt: null,
          registeredAt,
          lastError: null,
        });

        await manager.save(HealthInformationDispatchLog, log);
        return log.id;
      });

      await this.queueService.addHealthInformationDispatchJob({ logId });

      return {
        kit: new RegisterPractitionerKitDto().fromEntity(practitionerKit),
        logId,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
