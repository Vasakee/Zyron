import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export enum ReportType {
  GUTSCAN = 'gutscan',
  DEEPGUT = 'deepgut',
}

export class SendSampleReportDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(ReportType)
  @IsNotEmpty()
  reportType: ReportType;
}
