import { ApiProperty } from '@nestjs/swagger';
import { CustomerProfile } from '../entity/customer-profile.entity';
import { CustomerProfileStatus } from 'src/enum';
import { User } from 'src/user/entity/user.entity';

export class FetchCustomerProfilesDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  clientName: string;

  @ApiProperty()
  kitId: string;

  @ApiProperty({ required: false })
  reportReleaseDate?: Date;

  @ApiProperty({ required: false })
  vaariAnalysisDate?: Date;

  @ApiProperty({ enum: CustomerProfileStatus })
  status: CustomerProfileStatus;

  @ApiProperty()
  createdByRole: string;

  @ApiProperty()
  user: User;

  @ApiProperty({ required: false })
  lastUpdatedBy?: User;

  @ApiProperty({ required: false })
  lastUpdatedByRole?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  fromEntity(entity: CustomerProfile): FetchCustomerProfilesDto {
    this.id = entity.id;
    this.clientName = entity.clientName;
    this.kitId = entity.kitId;
    this.reportReleaseDate = entity.reportReleaseDate;
    this.vaariAnalysisDate = entity.vaariAnalysisDate;
    this.status = entity.status;
    this.user = entity.user;
    this.lastUpdatedBy = entity.lastUpdatedBy;
    this.createdByRole = entity.createdByRole;
    this.lastUpdatedByRole = entity.lastUpdatedByRole;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
    return this;
  }
}
