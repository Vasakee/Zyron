import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { DateTime } from 'luxon';
import {
  AllowedCountries,
  AllowedCountriesAbbrev,
  Currency,
  Source,
} from 'src/enum';
import { ShotgunWaitlist } from '../entity/shotgun-waitlist.entity';
import { Order } from '../entity/order.entity';

export class ShotgunWaitlistDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty()
  @IsEnum(Currency)
  @IsNotEmpty()
  currency: Currency;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'Quantity must be greater than 0' })
  quantity: number;

  referenceId: string;

  userId: string;

  status: string;

  completedAt: Date;

  public toEntity(payload: ShotgunWaitlistDto) {
    const data = new ShotgunWaitlistDto();
    if (payload.country)
      data.country =
        payload.country === AllowedCountries.US
          ? AllowedCountriesAbbrev.US
          : AllowedCountriesAbbrev.CA;
    data.currency = payload.currency;
    data.email = payload.email;
    data.firstName = payload.firstName;
    data.lastName = payload.lastName;
    if (payload.quantity) data.quantity = payload.quantity;
    data.completedAt = DateTime.local().toJSDate();
    data.referenceId = payload.referenceId;
    if (payload.userId) data.userId = payload.userId;
    return data;
  }

  public toOrderEntity(payload: ShotgunWaitlistDto) {
    const data = new Order();
    data.email = payload.email;
    data.firstName = payload.firstName;
    data.lastName = payload.lastName;
    if (payload.country)
      data.country =
        payload.country === AllowedCountries.US
          ? AllowedCountriesAbbrev.US
          : AllowedCountriesAbbrev.CA;
    data.currency = payload.currency;
    if (payload.userId) data.userId = payload.userId;
    data.referenceId = payload.referenceId;
    data.quantity = payload.quantity;
    data.source = Source.Waitlist;
    return data;
  }

  public fromEntity(payload: ShotgunWaitlist) {
    const data = new ShotgunWaitlist();
    data.id = payload.id;
    data.country = payload.country;
    data.email = payload.email;
    data.firstName = payload.firstName;
    data.lastName = payload.lastName;
    data.addressLineOne = payload.addressLineOne;
    data.addressLineTwo = payload.addressLineTwo;
    data.city = payload.city;
    data.postalCode = payload.postalCode;
    data.state = payload.state;
    data.status = payload.status;
    data.createdAt = payload.createdAt;
    return data;
  }
}

export class OrdersQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchQuery: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  status: string;
}

export class PaymentLinkTestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  orderId: string;
}
