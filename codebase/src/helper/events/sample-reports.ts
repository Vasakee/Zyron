import { ReportType } from '../../testkit-sample-reports/dto/send-sample-report.dto';

export interface SampleReportEvent {
  to: string;
  reportType: ReportType;
}
