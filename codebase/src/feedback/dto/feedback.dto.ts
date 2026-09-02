import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Feedback } from '../entity/feedback.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeedbackDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  referenceEmail: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  satisfaction: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  code: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  awarenessChannel: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  source: string;

  name: string;

  email: string;

  public toEntity(payload: CreateFeedbackDto) {
    const data = new Feedback();
    data.name = payload.name;
    data.email = payload.email;
    data.referenceEmail = payload.referenceEmail;
    data.sessionId = payload.sessionId;
    data.awarenessChannel = payload.awarenessChannel;
    data.satisfaction = payload.satisfaction;
    data.source = payload.source;
    return data;
  }

  public fromEntity(payload: Feedback) {
    const data = new Feedback();
    data.email = payload.email;
    data.name = payload.name;
    data.referenceEmail = payload.referenceEmail;
    data.awarenessChannel = payload.awarenessChannel;
    data.satisfaction = payload.satisfaction;
    data.source = payload.source;
    return data;
  }
}

export class FeedBackQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchQuery: string;
}
