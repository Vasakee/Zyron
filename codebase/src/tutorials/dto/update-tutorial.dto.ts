import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Tutorials } from '../entity/tutorial.entity';
import { AccountRoles, KitStatus, ResourceTypes } from 'src/enum';

export class UpdateTutorialDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEnum([...Object.values(AccountRoles)])
  category: string;

  imageUrl: string;

  videoUrl: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsEnum([...Object.values(ResourceTypes)])
  resourceType: string;

  documentUrl: string;

  pptUrl: string;

  public toEntity(data: Tutorials, payload: UpdateTutorialDto) {
    data.title = payload.title;
    if (payload.resourceType) {
      data.resourceType = payload.resourceType;
    }
    if (payload.documentUrl) {
      data.documentUrl = payload.documentUrl;
    }
    if (payload.pptUrl) {
      data.pptUrl = payload.pptUrl;
    }
    if (payload.imageUrl) {
      data.imageUrl = payload.imageUrl;
    }
    if (payload.videoUrl) {
      data.videoUrl = payload.videoUrl;
    }
    data.category = payload.category;
    return data;
  }

  public fromEntity(payload: Tutorials) {
    const data = new Tutorials();
    data.id = payload.id;
    data.title = payload.title;
    data.resourceType = payload.resourceType;
    data.documentUrl = payload.documentUrl;
    data.pptUrl = payload.pptUrl;
    data.imageUrl = payload.imageUrl;
    data.videoUrl = payload.videoUrl;
    data.category = payload.category;
    data.createdAt = payload.createdAt;

    return data;
  }
}
// function ApiPropertyOptional(): (
//   target: UpdateTutorialDto,
//   propertyKey: 'resourceType',
// ) => void {
//   throw new Error('Function not implemented.');
// }

// function IsOptional(): (
//   target: UpdateTutorialDto,
//   propertyKey: 'resourceType',
// ) => void {
//   throw new Error('Function not implemented.');
// }
