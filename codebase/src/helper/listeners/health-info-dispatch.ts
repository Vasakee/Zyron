import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';
import { FRONTEND_URL, POSTMARK_VERIFIED_EMAIL } from 'src/config/keys';
import { mailService } from 'src/mail/mail';
import { HealthInfoDispatchEvent } from '../events/health-info-dispatch';
import { HealthInformationDispatchLog } from 'src/health-info/entity/health-information-dispatch-log.entity';
import { DispatchStatus } from 'src/enum';

@Injectable()
export class HealthInfoDispatchListener {
  private readonly logger = new Logger(HealthInfoDispatchListener.name);

  constructor(private readonly dataSource: DataSource) {}

  @OnEvent('health.info.dispatch', { async: true })
  async handleHealthInfoDispatch(event: HealthInfoDispatchEvent) {
    await this.dataSource.transaction(async (manager) => {
      const log = await manager.findOne(HealthInformationDispatchLog, {
        where: { id: event.logId },
      });

      if (!log) {
        this.logger.warn(`Dispatch log ${event.logId} not found`);
        return;
      }

      const date = new Date();
      const year = date.getFullYear();
      const html = await mailService.renderHtml(
        {
          name: event.name,
          practitionerName: event.practitionerName,
          email: event.email,
          link: `${FRONTEND_URL}/client-health-information/${event.kitId}`,
          year,
        },
        'complete_health_info.html',
      );

      const msg = {
        to: event.email,
        from: POSTMARK_VERIFIED_EMAIL,
        subject: `Complete Health Information for Vitract Gut Test`,
        html: String(html),
      };

      try {
        await mailService.sendMail(msg);

        log.status = DispatchStatus.SENT;
        log.sentAt = new Date();
        await manager.save(HealthInformationDispatchLog, log);

        this.logger.log(`Successfully sent info for log ${log.id}`);
      } catch (error) {
        const message = String(error?.message ?? error).slice(0, 4000);
        log.status = DispatchStatus.FAILED;
        log.lastError = message;
        await manager.save(HealthInformationDispatchLog, log);

        this.logger.error(`Email sending failed for log ${log.id}`, error);
        throw error;
      }
    });
  }
}
