import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Kit } from '../entity/kit.entity';
import { HealthInfoStatus, KitStatus } from 'src/enum';
import { PractitionerKit } from '../entity/practitioner-kits.entity';

export class UpdatePractitionerKitNameDto {
  @ApiProperty({
    description: 'The kit number to identify which kit to update',
    type: String,
    example: 'KIT-12345',
  })
  @IsString()
  @IsNotEmpty()
  kitNumber: string;

  @ApiProperty({
    description: 'The new name for the practitioner kit',
    type: String,
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateDateOfSampleCollectionDto {
  @ApiProperty({
    description: 'The date when the sample was collected',
    type: String,
    format: 'date-time',
    example: '2024-01-15T10:30:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  dateOfSampleCollection: Date;

  public updateKitEntity(data: Kit, payload: UpdateDateOfSampleCollectionDto) {
    data.dateOfSampleCollection = payload.dateOfSampleCollection;
    return data;
  }

  public updatePractitionerKitEntity(
    data: PractitionerKit,
    payload: UpdateDateOfSampleCollectionDto,
  ) {
    data.dateOfSampleCollection = payload.dateOfSampleCollection;
    return data;
  }
}

export class UpdateKitDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  kitNumber: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  dateOfSampleCollection: Date;

  public updateEntity(data: Kit, payload: UpdateKitDto) {
    data.kitNumber = payload.kitNumber;
    data.dateOfSampleCollection = payload.dateOfSampleCollection;
    return data;
  }

  public fromEntity(payload: Kit) {
    const data = new Kit();
    data.id = payload.id;
    data.kitNumber = payload.kitNumber;
    data.status = payload.status;
    data.lockStatus = payload.lockStatus;
    data.createdAt = payload.createdAt;
    return data;
  }
}

export class UpdateKitStatusDto {
  @ApiProperty({
    description: 'The new status of the kit',
    enum: KitStatus,
    enumName: 'KitStatus',
    example: KitStatus.LAB_PROCESSING,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum([...Object.values(KitStatus)])
  status: string;

  @ApiPropertyOptional({
    description: 'Indicates whether health information has been completed',
    enum: HealthInfoStatus,
    enumName: 'HealthInfoStatus',
    example: HealthInfoStatus.YES,
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsEnum([...Object.values(HealthInfoStatus)])
  healthInfoCompleted: string;

  @ApiPropertyOptional({
    description:
      'Indicates if the update is made by a client (as opposed to admin/practitioner)',
    type: Boolean,
    example: false,
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isClient: boolean;

  @ApiPropertyOptional({
    description:
      'Indicates if the kit has been submitted for processing. When true, automatically sets healthInfoCompleted to "yes"',
    type: Boolean,
    example: true,
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  submitted: boolean;

  @ApiPropertyOptional({
    description: `
      Date associated with the status change.
      - For SAMPLE_RECEIVED: This becomes the dateReceivedByLab
      - For LAB_PROCESSING: This becomes the resultsAvailable date
      
      Format: ISO 8601 date-time string
    `,
    type: String,
    format: 'date-time',
    example: '2024-01-15T10:30:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  date: Date;

  @ApiPropertyOptional({
    description: 'Date when the sample was collected',
    type: String,
    format: 'date-time',
    example: '2024-01-15T10:30:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  dateOfSampleCollection: Date;

  public updateEntityI(data: Kit, payload: UpdateKitStatusDto) {
    data.status = payload.status;
    data.healthInfoCompleted = payload.healthInfoCompleted
      ? payload.healthInfoCompleted
      : payload.submitted
        ? 'yes'
        : 'no';
    data.submitted = payload.submitted ? payload.submitted : false;
    if (payload.status === KitStatus.SAMPLE_RECIEVED)
      data.dateReceivedByLab = payload.date;
    if (payload.status === KitStatus.LAB_PROCESSING)
      data.resultsAvailable = payload.date;
    if (payload.dateOfSampleCollection)
      data.dateOfSampleCollection = payload.dateOfSampleCollection;
    return data;
  }

  public updatePractitionerEntity(
    data: PractitionerKit,
    payload: UpdateKitStatusDto,
  ) {
    data.status = payload.status;
    data.healthInfoCompleted = payload.healthInfoCompleted
      ? payload.healthInfoCompleted
      : payload.submitted
        ? 'yes'
        : 'no';
    data.submitted = payload.submitted ? payload.submitted : false;
    if (payload.dateOfSampleCollection)
      data.dateOfSampleCollection = payload.dateOfSampleCollection;
    if (payload.status === KitStatus.SAMPLE_RECIEVED)
      data.dateReceivedByLab = payload.date;
    if (payload.status === KitStatus.LAB_PROCESSING)
      data.resultsAvailable = payload.date;
    return data;
  }

  public fromEntity(payload: Kit) {
    const data = new Kit();
    data.id = payload.id;
    data.kitNumber = payload.kitNumber;
    data.kitType = payload.kitType;
    data.healthInfoCompleted = payload.healthInfoCompleted;
    data.submitted = payload.submitted;
    data.status = payload.status;
    data.lockStatus = payload.lockStatus;
    data.dateOfSampleCollection = payload.dateOfSampleCollection;
    data.dateReceivedByLab = payload.dateReceivedByLab;
    data.resultsAvailable = payload.resultsAvailable;
    data.createdAt = payload.createdAt;
    return data;
  }

  public fromPractitionerEntity(payload: PractitionerKit) {
    const data = new PractitionerKit();
    data.id = payload.id;
    data.kitNumber = payload.kitNumber;
    data.kitType = payload.kitType;
    data.healthInfoCompleted = payload.healthInfoCompleted;
    data.submitted = payload.submitted;
    data.status = payload.status;
    data.lockStatus = payload.lockStatus;
    data.dateOfSampleCollection = payload.dateOfSampleCollection;
    data.dateReceivedByLab = payload.dateReceivedByLab;
    data.resultsAvailable = payload.resultsAvailable;
    data.registeredViaAuto = payload.registeredViaAuto;
    data.createdAt = payload.createdAt;
    return data;
  }
}
