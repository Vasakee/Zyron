import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Support } from '../entity/support.entity';
import { v4 as uuidv4 } from 'uuid';
import { SupportMessage } from '../entity/support-message.entity';

export class SupportDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty()
  @IsString()
  subject: string;

  userId: string;

  public toEntity(payload: SupportDto) {
    const data = new Support();
    data.userId = payload.userId;
    data.inquiryId = `VT-${uuidv4().toString().split('-')[0].toUpperCase()}`;
    data.subject = payload.subject;
    data.message = payload.message;
    return data;
  }

  public fromEntity(payload: Support) {
    const data = new Support();
    data.id = payload.id;
    data.inquiryId = payload.inquiryId;
    data.userId = payload.userId;
    data.subject = payload.subject;
    data.message = payload.message;
    data.priority = payload.priority;
    data.status = payload.status;
    data.assignedTo = payload.assignedTo;
    data.user = payload.user;
    data.createdAt = payload.createdAt;
    return data;
  }

  public fromSingleEntity(payload: Support, messages: SupportMessage[]) {
    const data = new Support();
    data.id = payload.id;
    data.inquiryId = payload.inquiryId;
    data.userId = payload.userId;
    data.subject = payload.subject;
    data.message = payload.message;
    data.priority = payload.priority;
    data.status = payload.status;
    data.assignedTo = payload.assignedTo;
    data.messages = messages ?? [];
    data.user = payload.user;
    data.createdAt = payload.createdAt;
    return data;
  }
}

export class SupportQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchQuery: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  status: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  priority: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  assignedTo: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  dateFrom: Date;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  dateTo: Date;
}
