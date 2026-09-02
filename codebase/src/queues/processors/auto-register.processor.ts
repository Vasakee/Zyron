import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import {
  QueueNames,
  AutoRegisterPractitionerOrderKitsJobData,
  JobTypes,
} from '../types/queue.types';
import { Order } from 'src/order/entity/order.entity';
import { DataSource } from 'typeorm';
import { HealthInformationDispatchLog } from 'src/health-info/entity/health-information-dispatch-log.entity';
import { Injectable, Logger } from '@nestjs/common';
import { DeliveryMode, DispatchStatus, RegistrationSource } from 'src/enum';
import { RegisterPractitionerKitService } from 'src/kit/service/register-practitioner-kit';
import { RegisterPractitionerKitDto } from 'src/kit/dto/register-practitioner-kit.dto';
import { ConflictErrorException } from 'src/common';
import { DateTime } from 'luxon';

@Injectable()
@Processor(QueueNames.KIT)
export class AutoRegisterPractitionerOrderKitsProcessor {
  private readonly logger = new Logger(
    AutoRegisterPractitionerOrderKitsProcessor.name,
  );

  constructor(
    private readonly registerPractitionerKitService: RegisterPractitionerKitService,
    private readonly dataSource: DataSource,
  ) { }

  @Process(JobTypes.AUTO_REGISTER_PRACTITIONER_ORDER_KITS)
  async process(
    job: Job<AutoRegisterPractitionerOrderKitsJobData>,
  ): Promise<void> {
    const { orderId, kitId } = job.data;
    this.logger.log(
      `Processing auto-register for order ${orderId} kit ${kitId}`,
    );

    try {
      await this.dataSource.transaction(async (manager) => {
        const order = await manager.findOne(Order, {
          where: { id: orderId },
        });

        if (!order) {
          this.logger.error(`Order ${orderId} not found`);
          throw new Error(`Order ${orderId} not found`);
        }

        // Skip auto-registration for on-site orders
        if (order.deliveryMode === DeliveryMode.ON_SITE) {
          this.logger.log(
            `Skipping auto-registration for on-site order ${orderId} kit ${kitId}`,
          );
          return;
        }

        const dto = new RegisterPractitionerKitDto();
        dto.kitNumber = kitId;
        dto.userId = order.userId;
        dto.name = `${order.firstName} ${order.lastName}`;
        dto.source = RegistrationSource.AUTO;

        try {
          await this.registerPractitionerKitService.execute(dto, manager);
          this.logger.log(`Registered kit ${kitId} for order ${orderId}`);
        } catch (error) {
          if (error instanceof ConflictErrorException) {
            this.logger.log(`Kit ${kitId} already registered.`);
          } else {
            this.logger.error(`Failed to register kit ${kitId}`, error);
            throw error;
          }
        }

        // Create or Update dispatch log using upsert for idempotency/concurrency
        const existingLog = await manager.findOne(HealthInformationDispatchLog, {
          where: { orderId: order.id, kitId: kitId },
        });

        if (existingLog) {
          const isSame =
            existingLog.orderId === order.id &&
            existingLog.kitId === kitId &&
            existingLog.practitionerId === order.userId &&
            existingLog.recipientEmail === order.email;

          existingLog.practitionerId = order.userId;
          existingLog.recipientEmail = order.email;

          if (!isSame) {
            existingLog.status = DispatchStatus.PENDING;
            existingLog.lastAttemptedAt = null
            existingLog.attempts = 0
            existingLog.lastError = null
            const rows = (await manager.query(
              `
                SELECT SYSUTCDATETIME() AS nowUtc;
              `,
            )) as Array<{ nowUtc: string }>;
            existingLog.registeredAt = new Date(rows[0].nowUtc);
          }

          await manager.save(HealthInformationDispatchLog, existingLog);
        } else {
          const log = manager.create(HealthInformationDispatchLog, {
            orderId: order.id,
            kitId: kitId,
            practitionerId: order.userId,
            recipientEmail: order.email,
            status: DispatchStatus.PENDING,
            attempts: 0,
            lastAttemptedAt: null,
            registeredAt: DateTime.utc().toJSDate(),
            lastError: null,
          });
          await manager.save(HealthInformationDispatchLog, log);
        }

        this.logger.log(
          `Upserted dispatch log for order ${order.id} kit ${kitId}`,
        );
      });
    } catch (error) {
      this.logger.error(
        `Failed to process auto-register for order ${orderId} kit ${kitId}`,
        error,
      );
      throw error;
    }
  }
}
