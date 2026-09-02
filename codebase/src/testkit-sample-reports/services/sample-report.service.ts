import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SendSampleReportDto, ReportType } from '../dto/send-sample-report.dto';
import { mailService } from '../../mail/mail';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SampleReportEvent } from '../../helper/events/sample-reports';

@Injectable()
export class SampleReportService {
  constructor(private eventEmitter: EventEmitter2) {}

  async sendSampleReport(
    sendSampleReportDto: SendSampleReportDto,
  ): Promise<void> {
    const { email, reportType } = sendSampleReportDto;

    try {
      this.eventEmitter.emit('sample-reports.send-demo', {
        to: email,
        reportType,
      } as SampleReportEvent);
    } catch (error) {
      console.error('Error sending sample report:', error);
      throw new InternalServerErrorException('Failed to send sample report');
    }
  }

  async getEmailContent(reportType: ReportType): Promise<{
    subject: string;
    html: string;
  }> {
    switch (reportType) {
      case ReportType.GUTSCAN:
        return {
          subject: 'Your GutScan Sample Report',
          html: await this.getGutScanTemplate(),
        };
      case ReportType.DEEPGUT:
        return {
          subject: 'Your DeepGut Sample Report',
          html: await this.getDeepGutTemplate(),
        };
      default:
        throw new Error('Invalid report type');
    }
  }

  private async getGutScanTemplate(): Promise<string> {
    return (await mailService.renderHtml(
      {
        attachment_url:
          'https://website-media-v2.s3.us-east-1.amazonaws.com/Gutscan_Demo.pdf',
      },
      'gut-scan-demo.html',
    )) as string;
  }

  private async getDeepGutTemplate(): Promise<string> {
    return (await mailService.renderHtml(
      {
        attachment_url:
          'https://website-media-v2.s3.us-east-1.amazonaws.com/Deepgut__Demo.pdf',
      },
      'deep-gut-demo.html',
    )) as string;
  }
}
