import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Practitioner } from '../entity/practitioner.entity';
import { User } from 'src/user/entity/user.entity';

export class UpdatePractitionerAccountDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  practiceUrl?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  practiceName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty()
  @IsString()
  @ApiProperty()
  @IsString()
  @IsOptional()
  degree?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  gutTestUsedName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  monthlyClients?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  gutTestUse?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  practitionerType?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  countryLocation?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  stateLocation: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  cityLocation: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  zipCode: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  awarenessChannel?: string;

  public toUserEntity(payload: UpdatePractitionerAccountDto) {
    const data = new User();
    data.firstName = payload.firstName;
    data.lastName = payload.lastName;
    data.awarenessChannel = payload.awarenessChannel;
    if (payload.phone) data.phone = payload.phone;
    return data;
  }

  public toEntity(payload: UpdatePractitionerAccountDto) {
    const data = new Practitioner();
    data.practiceName = payload.practiceName;
    data.degree = payload.degree;
    data.zipCode = payload.zipCode;
    data.cityLocation = payload.cityLocation;
    data.stateLocation = payload.stateLocation;
    data.countryLocation = payload.countryLocation;
    data.gutTestUse = payload.gutTestUse;
    data.practiceUrl = payload.practiceUrl;
    data.monthlyClients = payload.monthlyClients;
    data.gutTestUsedName = payload.gutTestUsedName;
    if (payload.gutTestUse) data.gutTestUse = payload.gutTestUse;
    if (payload.gutTestUsedName) data.gutTestUsedName = payload.gutTestUsedName;
    return data;
  }
}
