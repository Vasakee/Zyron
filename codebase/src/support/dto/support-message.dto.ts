import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { SupportMessage } from '../../support/entity/support-message.entity';
import { AccountRoles, InquiryStatus, SenderType } from 'src/enum';
import { ManyToOne, JoinColumn } from 'typeorm';
import { Support } from 'src/support/entity/support.entity';

export class SupportMessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  sender: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  supportId: string;

  userId: string;

  status: string;

  public toEntity(payload: SupportMessageDto) {
    const data = new SupportMessage();
    data.userId = payload.userId;
    data.supportId = payload.supportId;
    data.content = payload.content;
    data.sender = payload.sender;
    data.status = payload.status;
    return data;
  }

  public fromEntity(payload: SupportMessage) {
    const data = new SupportMessage();
    data.id = payload.id;
    data.supportId = payload.supportId;
    data.content = payload.content;
    data.sender = payload.sender;
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
