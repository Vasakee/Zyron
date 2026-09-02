import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Kit } from '../entity/kit.entity';
import { FamilyKit } from '../entity/family-kit.entity';
import { PractitionerKit } from '../entity/practitioner-kits.entity';
import { KitStatus } from 'src/enum';

export class CompleteReportDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pdfUrl: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  taxonomyUrl: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  summaryUrl: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  amrUrl: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fastQUrl: string;

  public updateEntity(data: Kit, payload: CompleteReportDto) {
    data.pdfUrl = payload.pdfUrl;
    data.taxonomyUrl = payload.taxonomyUrl;
    if (payload.summaryUrl) data.summaryUrl = payload.summaryUrl;
    if (payload.amrUrl) data.amrUrl = payload.amrUrl;
    data.fastQUrl = payload.fastQUrl;
    data.status = KitStatus.RESULT_READY;
    data.resultsAvailable = new Date();
    // data.lockStatus
    return data;
  }

  public updateFamilyKitEntity(data: FamilyKit, payload: CompleteReportDto) {
    data.pdfUrl = payload.pdfUrl;
    data.taxonomyUrl = payload.taxonomyUrl;
    data.summaryUrl = payload.summaryUrl;
    data.fastQUrl = payload.fastQUrl;
    data.status = KitStatus.RESULT_READY;
    data.resultsAvailable = new Date();
    // data.lockStatus
    return data;
  }

  public updatePractitionerEntity(
    data: PractitionerKit,
    payload: CompleteReportDto,
  ) {
    data.pdfUrl = payload.pdfUrl;
    data.taxonomyUrl = payload.taxonomyUrl;
    if (payload.summaryUrl) data.summaryUrl = payload.summaryUrl;
    if (payload.amrUrl) data.amrUrl = payload.amrUrl;
    data.fastQUrl = payload.fastQUrl;
    data.status = KitStatus.RESULT_READY;
    data.resultsAvailable = new Date();
    // data.lockStatus
    return data;
  }
}
