import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import {
  QueueNames,
  HealthInformationDispatchJobData,
  JobTypes,
} from '../types/queue.types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { HealthInformationDispatchLog } from '../../health-info/entity/health-information-dispatch-log.entity';
import { Logger } from '@nestjs/common';
import { DispatchStatus } from '../../enum';
import { Order } from '../../order/entity/order.entity';
import { User } from '../../user/entity/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FRONTEND_URL } from 'src/config/keys';
import { PractitionerKit } from 'src/kit/entity/practitioner-kits.entity';

@Processor(QueueNames.KIT)
export class HealthInformationDispatchProcessor {
  private readonly logger = new Logger(HealthInformationDispatchProcessor.name);

  constructor(
    @InjectRepository(HealthInformationDispatchLog)
    private readonly dispatchLogRepo: Repository<HealthInformationDispatchLog>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(PractitionerKit)
    private readonly practitionerKitRepo: Repository<PractitionerKit>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  @Process(JobTypes.HEALTH_INFORMATION_DISPATCH)
  async process(job: Job<HealthInformationDispatchJobData>): Promise<void> {
    const { logId } = job.data;

    const claimed = await this.claimQueuedLogForProcessing(logId);

    if (!claimed) {
      this.logger.debug(`Skip logId=${logId}`);
      return;
    }

    try {
      const [order, practitioner, practitionerKit] = await Promise.all([
        this.orderRepo.findOne({ where: { id: claimed.orderId } }),
        this.userRepo.findOne({ where: { id: claimed.practitionerId } }),
        this.practitionerKitRepo.findOne({
          where: { kitNumber: claimed.kitId },
        }),
      ]);

      if (!order) throw new Error(`Order ${claimed.orderId} not found`);
      if (!practitioner)
        throw new Error(`Practitioner ${claimed.practitionerId} not found`);
      if (!practitionerKit)
        throw new Error(
          `Practitioner kit for kitNumber ${claimed.kitId} not found`,
        );

      const year = new Date().getUTCFullYear();

      const payload = {
        logId,
        email: claimed.recipientEmail,
        name: `${order.firstName} ${order.lastName}`,
        practitionerName: `${practitioner.firstName} ${practitioner.lastName}`,
        kitId: practitionerKit.id,
        link: `${FRONTEND_URL}/client-health-information/${practitionerKit.id}`,
      };

      this.eventEmitter.emit('health.info.dispatch', payload);

      this.logger.log(`Emitted mail event for logId=${logId}`);
    } catch (err: any) {
      const msg = String(err?.message ?? err).slice(0, 4000);

      await this.dispatchLogRepo.update(
        { id: logId },
        { status: DispatchStatus.FAILED, lastError: msg },
      );

      this.logger.error(`Dispatch failed for logId=${logId}`, err);
      throw err;
    }
  }

  private async claimQueuedLogForProcessing(logId: string): Promise<{
    orderId: string;
    practitionerId: string;
    recipientEmail: string;
    kitId: string;
  } | null> {
    const sql = `
      SET NOCOUNT ON;

      UPDATE health_information_dispatch_logs
      SET status = @0, attempts = attempts + 1, lastAttemptedAt = SYSUTCDATETIME(), lastError = NULL
      OUTPUT INSERTED.orderId, INSERTED.practitionerId, INSERTED.recipientEmail, INSERTED.kitId
      WHERE id = @1 AND status = @2;
    `;

    const rows = (await this.dataSource.query(sql, [
      DispatchStatus.PROCESSING,
      logId,
      DispatchStatus.QUEUED,
    ])) as Array<{
      orderId: string;
      practitionerId: string;
      recipientEmail: string;
      kitId: string;
    }>;

    return rows[0] ?? null;
  }
}
