import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { POSTMARK_VERIFIED_EMAIL } from 'src/config/keys';
import { mailService } from '../../mail/mail';
import { SampleReportEvent } from '../events/sample-reports';
import { SampleReportService } from '../../testkit-sample-reports/services/sample-report.service';

@Injectable()
export class SampleReportsListener {
  constructor(private readonly reportService: SampleReportService) { }

  @OnEvent('sample-reports.send-demo', { async: true })
  async handleEvent(event: SampleReportEvent): Promise<void> {
    try {
      const emailContent = await this.reportService.getEmailContent(
        event.reportType,
      );

      const msg = {
        to: event.to,
        from: `"Vitract" <${POSTMARK_VERIFIED_EMAIL}>`,
        subject: emailContent.subject,
        html: String(emailContent.html),
        text: 'See attached sample report',
      };

      await mailService.sendMail(msg);
    } catch (error) {
      console.error('Failed to send sample report email:', error);
      throw error;
    }
  }
}
