import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Practitioner } from '../entity/practitioner.entity';
import { AccountRoles, PractitionerAccountStatus } from 'src/enum';
import { User } from 'src/user/entity/user.entity';
import { Order } from 'src/common';
import { Type } from 'class-transformer';

export class CreatePractitionerAccountDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  practiceName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  practiceUrl: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  degree: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  gutTestUsedName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  gutTestUse: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  monthlyClients: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  practitionerType: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  countryLocation: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  stateLocation: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cityLocation: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  awarenessChannel: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  public toPractitionerEntity(payload: CreatePractitionerAccountDto) {
    const data = new Practitioner();
    data.practiceName = payload.practiceName;
    data.practiceUrl = payload.practiceUrl;
    data.status = PractitionerAccountStatus.UnderReview;
    data.degree = payload.degree;
    data.zipCode = payload.zipCode;
    data.cityLocation = payload.cityLocation;
    data.stateLocation = payload.stateLocation;
    data.countryLocation = payload.countryLocation;
    data.gutTestUse = payload.gutTestUse;
    data.practitionerType = payload.practitionerType;
    data.gutTestUsedName = payload.gutTestUsedName;
    data.monthlyClients = payload.monthlyClients;
    if (payload.gutTestUse) data.gutTestUse = payload.gutTestUse;
    if (payload.gutTestUsedName) data.gutTestUsedName = payload.gutTestUsedName;
    return data;
  }

  public toEntity(payload: CreatePractitionerAccountDto, passwordHash: string) {
    const data = new User();
    data.firstName = payload.firstName;
    data.lastName = payload.lastName;
    data.email = payload.email;
    data.role = AccountRoles.PRACTITIONER;
    if (payload.phone) data.phone = payload.phone;
    data.password = passwordHash;
    data.practitioner = this.toPractitionerEntity(payload);
    return data;
  }

  public fromEntity(payload: User) {
    const data: any = {};
    const practitioner: any = {};
    data.practitioner = practitioner;
    data.id = payload.id;
    data.firstName = payload.firstName;
    data.firstName = payload.lastName;
    data.practitioner.practiceName = payload.practitioner.practiceName;
    data.practitioner.awarenessChannel = payload.awarenessChannel;
    data.practitioner.degree = payload.practitioner.degree;
    data.practitioner.zipCode = payload.practitioner.zipCode;
    data.practitioner.cityLocation = payload.practitioner.cityLocation;
    data.practitioner.stateLocation = payload.practitioner.stateLocation;
    data.practitioner.countryLocation = payload.practitioner.countryLocation;
    data.practitioner.gutTestUse = payload.practitioner.gutTestUse;
    data.practitioner.typeOfPractitioner =
      payload.practitioner.practitionerType;
    data.practitioner.gutTestUsedName = payload.practitioner.gutTestUsedName;
    data.email = payload.email;
    data.phone = payload.phone;
    data.avatar = payload.avatar;
    data.monthlyClients = payload.practitioner.monthlyClients;
    data.createdAt = payload.createdAt;
    data.updatedAt = payload.updatedAt;
    return data;
  }

  public fromPractitionerEntity(payload: Practitioner) {
    const data: any = {};
    const user: any = {};
    data.user = user;
    data.id = payload.id;
    data.user.id = payload?.user?.id;
    data.user.firstName = payload?.user?.firstName;
    data.user.lastName = payload?.user?.lastName;
    data.practiceName = payload?.practiceName;
    data.awarenessChannel = payload?.user?.awarenessChannel;
    data.degree = payload?.degree;
    data.zipCode = payload?.zipCode;
    data.cityLocation = payload?.cityLocation;
    data.stateLocation = payload?.stateLocation;
    data.countryLocation = payload?.countryLocation;
    data.gutTestUse = payload?.gutTestUse;
    data.practitionerType = payload?.practitionerType;
    data.gutTestUsedName = payload?.gutTestUsedName;
    data.status = payload?.status;
    data.monthlyClients = payload?.monthlyClients;
    data.user.email = payload?.user?.email;
    data.user.phone = payload?.user?.phone;
    data.user.avatar = payload?.user?.avatar;
    data.user.createdAt = payload?.user?.createdAt;
    data.user.updatedAt = payload?.user?.updatedAt;
    return data;
  }
}

export class PractitionerQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchQuery: string;
}

export class PractitionerPageOptionsDto {
  @ApiPropertyOptional({ enum: Order, default: Order.ASC })
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.ASC;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly page?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly take?: number;

  get skip(): number {
    return this.take ? (this.page - 1) * this.take : 0;
  }
}
