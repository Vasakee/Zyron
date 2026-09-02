import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Kit } from '../entity/kit.entity';
import { LockStatus } from 'src/enum';
import { CreateClienttDto } from 'src/practitioner/dto/create-client.dto';
import { CreateCustomerAccountDto } from 'src/user/dto/customer-account.dto';

export class CreateKitDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  kitNumber: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  kitId: string;

  userId: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  dateOfSampleCollection: Date;

  @ApiProperty()
  @IsString()
  @IsEnum([...Object.values(LockStatus)])
  lockStatus: string;

  kitType: string;

  public toEntity(payload: CreateKitDto) {
    const data = new Kit();
    data.userId = payload.userId;
    data.kitNumber = payload.kitNumber;
    data.dateOfSampleCollection = payload.dateOfSampleCollection;
    data.lockStatus = payload.lockStatus;
    data.kitType = payload.kitType;
    return data;
  }

  public toUpdateEntity(payload: CreateKitDto) {
    const data = new Kit();
    data.kitNumber = payload.kitNumber;
    data.dateOfSampleCollection = payload.dateOfSampleCollection;
    return data;
  }

  public fromEntity(payload: Kit) {
    const data = new Kit();
    data.id = payload.id;
    data.userId = payload.userId;
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
    data.amrUrl = payload.amrUrl;
    data.createdAt = payload.createdAt;
    if (payload.user)
      data.user = new CreateCustomerAccountDto().fromEntity(payload.user);
    return data;
  }

  public fromPractitoinerEntity(payload: Kit) {
    const data = new Kit();
    data.id = payload.id;
    data.userId = payload.userId;
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
    data.amrUrl = payload.amrUrl;
    data.createdAt = payload.createdAt;
    data.user = new CreateCustomerAccountDto().fromEntity(payload.user);
    return data;
  }
}

export class KitQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchQuery: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  type: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  practitionerId?: string;
}
