import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { SendSampleReportDto } from '../dto/send-sample-report.dto';
import { SampleReportService } from '../services/sample-report.service';

@Controller('sample-reports')
export class SampleReportController {
  constructor(private readonly sampleReportService: SampleReportService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async sendSampleReport(@Body() sendSampleReportDto: SendSampleReportDto) {
    await this.sampleReportService.sendSampleReport(sendSampleReportDto);
    return {
      success: true,
      message: 'Sample report sent successfully',
    };
  }
}