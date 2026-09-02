import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { RegistrationSource } from 'src/enum';
import { PractitionerKit } from '../entity/practitioner-kits.entity';
import { detectKitTypeFromNumber } from 'src/common/utils/kit-type-detector';

export class RegisterPractitionerKitDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  kitNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  kitId: string;

  userId: string;

  practitionerId: string;

  kitType: string;

  registeredViaAuto: boolean | number;

  source?: RegistrationSource;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  dateOfSampleCollection: Date;

  public toEntity(payload: RegisterPractitionerKitDto) {
    const data = new PractitionerKit();
    data.name = payload.name;
    data.practitionerId = payload.practitionerId;
    data.kitNumber = payload.kitNumber;
    data.dateOfSampleCollection = payload.dateOfSampleCollection;
    data.kitType = detectKitTypeFromNumber(payload.kitNumber);

    const source = payload.source || RegistrationSource.MANUAL;
    data.registeredViaAuto = source === RegistrationSource.AUTO;

    return data;
  }

  public toUpdateEntity(payload: RegisterPractitionerKitDto) {
    const data = new PractitionerKit();
    data.kitNumber = payload.kitNumber;
    data.dateOfSampleCollection = payload.dateOfSampleCollection;
    return data;
  }

  public fromEntity(payload: PractitionerKit) {
    const data = new PractitionerKit();
    data.id = payload.id;
    data.name = payload.name;
    data.practitionerId = payload.practitionerId;
    data.dateOfSampleCollection = payload.dateOfSampleCollection;
    data.kitNumber = payload.kitNumber;
    data.kitType = payload.kitType;
    data.healthInfoCompleted = payload.healthInfoCompleted;
    data.submitted = payload.submitted;
    data.status = payload.status;
    data.lockStatus = payload.lockStatus;
    data.dateOfSampleCollection = payload.dateOfSampleCollection;
    data.dateReceivedByLab = payload.dateReceivedByLab;
    data.resultsAvailable = payload.resultsAvailable;
    data.pdfUrl = payload.pdfUrl;
    data.summaryUrl = payload.summaryUrl;
    data.taxonomyUrl = payload.taxonomyUrl;
    data.fastQUrl = payload.fastQUrl;
    data.registeredViaAuto = payload.registeredViaAuto;
    data.createdAt = payload.createdAt;
    return data;
  }
}
export class KitQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchQuery: string;
}
