import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
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
  DeliveryMode,
  KitType,
  OrderStatus,
} from 'src/enum';
import { Order } from 'src/order/entity/order.entity';

export class SaveOrderExternalDto {
  @ApiProperty({ description: 'First name of the customer placing the order' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Last name of the customer placing the order' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'Email of the customer placing the order' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description:
      'Country of the customer. Only "United States" or "Canada" (or "US"/"CA") is accepted',
    enum: [
      ...Object.values(AllowedCountries),
      ...Object.values(AllowedCountriesAbbrev),
    ],
  })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ description: 'Primary address line' })
  @IsString()
  @IsNotEmpty()
  addressLineOne: string;

  @ApiPropertyOptional({ description: 'Secondary address line (optional)' })
  @IsString()
  @IsOptional()
  addressLineTwo: string;

  @ApiProperty({ description: 'City of the shipping address' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'State or province of the shipping address' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'Postal or ZIP code of the shipping address' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({
    description: 'Number of kits to order. Must be greater than 0',
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'Quantity must be greater than 0' })
  quantity: number;

  @ApiProperty({ description: 'Type of kit to order' })
  @IsEnum([...Object.values(KitType)])
  @IsString()
  @IsNotEmpty()
  kitType: string;

  @ApiPropertyOptional({
    description:
      'Practitioner account email on Vitract. Required if usePractitionerAccount is true',
  })
  @IsString()
  @IsOptional()
  practitionerEmail: string;

  @ApiProperty({
    description:
      'Set to true only if you have a practitioner account on the Vitract platform and want this order tied to it',
  })
  @IsBoolean()
  @IsOptional()
  usePractitionerAccount?: boolean;

  @ApiProperty({
    description: 'Unique identifier for the payment transaction',
  })
  @IsString()
  @IsNotEmpty()
  paymentReferenceId: string;

  @ApiPropertyOptional({ enum: DeliveryMode })
  @IsEnum(DeliveryMode)
  @IsString()
  @IsOptional()
  deliveryMode?: DeliveryMode;

  username: string;

  userId: string;

  public toEntity(payload: SaveOrderExternalDto, source: string) {
    const data = new Order();

    data.referenceId = payload.paymentReferenceId;
    if (payload.country) {
      if (
        payload.country === AllowedCountries.US ||
        payload.country === AllowedCountriesAbbrev.US
      ) {
        data.country = AllowedCountriesAbbrev.US;
      } else if (
        payload.country === AllowedCountries.CA ||
        payload.country === AllowedCountriesAbbrev.CA
      ) {
        data.country = AllowedCountriesAbbrev.CA;
      } else {
        throw new Error('Unsupported country. Only US and CA are allowed.');
      }
    }

    data.email = payload.email;
    data.userId = payload.userId;
    data.firstName = payload.firstName;
    data.lastName = payload.lastName;
    data.addressLineOne = payload.addressLineOne;
    data.addressLineTwo = payload.addressLineTwo;
    data.city = payload.city;
    data.postalCode = payload.postalCode;
    data.state = payload.state;
    data.source = source;
    data.status = OrderStatus.Paid;
    if (payload.kitType) data.kitType = payload.kitType;
    if (payload.quantity) data.quantity = payload.quantity;
    if (payload.deliveryMode) data.deliveryMode = payload.deliveryMode;
    data.completedAt = DateTime.local().toJSDate();

    return data;
  }

  public fromEntity(payload: Order) {
    const data = new Order();
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
    data.kitId = payload.kitId;
    data.trackingNumber = payload.trackingNumber;
    data.trackingUrl = payload.trackingUrl;
    data.quantity = payload.quantity;
    data.shippingDate = payload.shippingDate;
    data.kitType = payload.kitType;
    data.createdAt = payload.createdAt;
    data.deliveryMode = payload.deliveryMode;
    return data;
  }
}
