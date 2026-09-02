import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Tutorials } from '../entity/tutorial.entity';
import { AccountRoles, ResourceTypes } from 'src/enum';

export class UploadTutorialDto {
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
  @IsNotEmpty()
  @IsEnum([...Object.values(ResourceTypes)])
  resourceType: string;

  documentUrl: string;

  pptUrl: string;

  public toEntity(payload: UploadTutorialDto) {
    const data = new Tutorials();
    data.title = payload.title;
    data.resourceType = payload.resourceType;
    data.documentUrl = payload.documentUrl;
    data.pptUrl = payload.pptUrl;
    data.imageUrl = payload.imageUrl;
    data.videoUrl = payload.videoUrl;
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

export class TutorialsQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchQuery: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  category: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsEnum([...Object.values(ResourceTypes)])
  resourceType: string;
}
