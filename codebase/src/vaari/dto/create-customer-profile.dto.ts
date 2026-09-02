import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CustomerProfileStatus, ProfileCreatorRole } from 'src/enum';

export class CreateCustomerProfileDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  clientName: string;

  @ApiProperty({ example: 'KIT12345' })
  @IsNotEmpty()
  @IsString()
  kitId: string;

  @ApiProperty({ example: '2025-08-19T10:00:00Z', required: false })
  @IsOptional()
  reportReleaseDate?: Date;

  @ApiProperty({ example: '2025-08-20T12:00:00Z', required: false })
  @IsOptional()
  vaariAnalysisDate?: Date;

  @ApiProperty({
    enum: CustomerProfileStatus,
    default: CustomerProfileStatus.PENDING,
  })
  @IsOptional()
  status?: CustomerProfileStatus;

  createdByRole?: ProfileCreatorRole;

  userId: string;
}

export class UpdateCustomerProfileStatusDto {
  @ApiProperty({
    enum: CustomerProfileStatus,
  })
  @IsNotEmpty()
  status: CustomerProfileStatus;

  @ApiProperty({ example: '2025-08-20T12:00:00Z', required: false })
  @IsOptional()
  vaariAnalysisDate?: Date;

  userId: string;
}
