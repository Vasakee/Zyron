import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ValidKit } from '../entity/valid-kit.entity';
import { KitStatus } from 'src/enum';

export class CreateValidKitDto {
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  kitId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  sequenceType: string;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  sampleType: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  expiryDate: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  status: string;

  public toEntity(payload: CreateValidKitDto) {
    const data = new ValidKit();
    // data.kitNumber = payload.kitNumber;
    data.kitId = payload.kitId;
    data.expiryDate = payload.expiryDate;
    data.status = payload.status;
    data.sampleType = payload.sampleType;
    data.sequenceType = payload.sequenceType;
    return data;
  }

  // public toUpdateEntity(payload: CreateValidKitDto) {
  //   const data = new Kit();
  //   data.kitNumber = payload.kitNumber;
  //   data.dateOfSampleCollection = payload.dateOfSampleCollection;
  //   return data;
  // }

  public fromEntity(payload: ValidKit): CreateValidKitDto {
    const data = new CreateValidKitDto();
    data.expiryDate = payload.expiryDate;
    data.kitId = payload.kitId;
    data.status = payload.status;
    data.sampleType = payload.sampleType;
    data.sequenceType = payload.sequenceType;
    return data;
  }
}
export class CreateBulkValidKitDto {
  @ApiProperty()
  csvFile: string;
}
export class KitQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchQuery: string;
}
