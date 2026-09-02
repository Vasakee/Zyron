import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Support } from '../entity/support.entity';

export class UpdateSupportDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  priority?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  assigneeId?: string;

  public updateEntityI(data: Support, payload: UpdateSupportDto) {
    if (payload.status) data.status = payload.status;
    if (payload.assigneeId) data.assigneeId = payload.assigneeId;
    if (payload.priority) data.priority = payload.priority;
    return data;
  }

  public fromEntity(payload: Support) {
    const data = new Support();
    data.id = payload.id;
    data.status = payload.status;
    data.assigneeId = payload.assigneeId;
    data.priority = payload.priority;
    data.message = payload.message;
    data.createdAt = payload.createdAt;
    return data;
  }
}
