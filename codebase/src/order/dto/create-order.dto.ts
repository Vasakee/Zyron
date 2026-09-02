import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Order } from '../entity/order.entity';
import { DateTime } from 'luxon';
import {
  AllowedCountries,
  AllowedCountriesAbbrev,
  ClientType,
  Currency,
  DeliveryMode,
  KitType,
  OrderStatus,
  OrderType,
  PaymentAction,
  Source,
} from 'src/enum';
import { fromCents, AmountWithActual } from 'src/common/utils';

const emptyStringToUndefined = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

export class OrderDto {
  @ApiPropertyOptional()
  @Transform(emptyStringToUndefined)
  @ValidateIf((o) => o.deliveryMode !== DeliveryMode.ON_SITE)
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiPropertyOptional()
  @Transform(emptyStringToUndefined)
  @ValidateIf((o) => o.deliveryMode !== DeliveryMode.ON_SITE)
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional()
  @Transform(emptyStringToUndefined)
  @ValidateIf((o) => o.deliveryMode !== DeliveryMode.ON_SITE)
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  addressLineOne: string;

  @ApiPropertyOptional()
  @IsEnum([...Object.values(KitType)])
  @IsString()
  @IsOptional()
  kitType: string;

  @ApiPropertyOptional({
    description: 'Whether this is a pre-order purchase',
    type: Boolean,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPreOrder?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  addressLineTwo: string;

  @ApiPropertyOptional()
  @IsEnum([...Object.values(PaymentAction)])
  @IsString()
  @IsOptional()
  paymentAction: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  paymentMethodId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'Quantity must be greater than 0' })
  quantity: number;

  @ApiProperty({ enum: OrderType })
  @IsEnum(OrderType)
  @IsNotEmpty()
  orderType: OrderType;

  @ApiProperty({ enum: Currency })
  @IsEnum(Currency)
  @IsNotEmpty()
  currency: Currency;

  @ApiPropertyOptional({ enum: DeliveryMode })
  @IsEnum(DeliveryMode)
  @IsString()
  @IsOptional()
  deliveryMode?: DeliveryMode;

  userId: string;

  userName: string;

  status: string;

  subPractitionerName: string;

  public toEntity(payload: OrderDto, referenceId: string) {
    const data = new Order();
    data.referenceId = referenceId;
    if (payload.country)
      data.country = [AllowedCountries.US, AllowedCountriesAbbrev.US].includes(
        payload.country as AllowedCountries | AllowedCountriesAbbrev,
      )
        ? AllowedCountriesAbbrev.US
        : AllowedCountriesAbbrev.CA;
    data.email = payload.email;
    data.firstName = payload.firstName;
    data.lastName = payload.lastName;
    data.addressLineOne = payload.addressLineOne;
    data.addressLineTwo = payload.addressLineTwo;
    data.city = payload.city;
    data.postalCode = payload.postalCode;
    data.state = payload.state;
    data.userId = payload.userId;
    if (payload.quantity) data.quantity = payload.quantity;
    data.currency = payload.currency;
    data.source = Source.Platform;
    data.subPractitionerName = payload.subPractitionerName ?? payload.userName;
    data.completedAt = DateTime.local().toJSDate();
    if (payload.status) data.status = payload.status;
    if (payload.kitType) data.kitType = payload.kitType;
    if (payload.deliveryMode) data.deliveryMode = payload.deliveryMode;
    return data;
  }

  public fromEntity(payload: Order) {
    const data = new Order();
    data.id = payload.id;
    data.user = payload.user;
    data.orderKits = payload.orderKits;
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
    data.registrationStatus = payload.registrationStatus;
    data.registeredBy = payload.registeredBy;
    data.kitType = payload.kitType;
    data.subPractitionerName = payload.subPractitionerName;
    data.deliveryMode = payload.deliveryMode;

    // Normalize amount handling based on order type
    let amount: AmountWithActual;
    if (payload.orderType === OrderType.PayAsYouGo) {
      // amountTotal is stored in cents
      amount = fromCents(
        payload.amountTotal * payload.quantity,
        (payload.currency as Currency) || Currency.USD,
      );
    } else if (payload?.paymentStatementItem) {
      // unitAmount is ALSO stored in cents (bigint in database)
      amount = fromCents(
        payload.paymentStatementItem.unitAmount *
        payload.paymentStatementItem.quantity,
        (payload.paymentStatementItem.currency as Currency) || Currency.USD,
      );
    } else {
      // Fallback: no payment statement item available
      amount = fromCents(0, (payload.currency as Currency) || Currency.USD);
    }

    // Set legacy fields for backward compatibility
    data.amountTotal = amount.actualAmount;
    data.currency = amount.currency;

    data.orderType = payload.orderType;
    data.createdAt = payload.createdAt;

    // Return data with structured amount
    return {
      ...data,
      amount: {
        amountInCents: amount.amount,
        actualAmount: amount.actualAmount,
        currency: amount.currency,
      },
    };
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

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  orderType: OrderType;
}

export class ConsentAcceptanceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  session_id: string;
}

export class SaveOrderDto {
  @ApiProperty()
  @Transform(emptyStringToUndefined)
  @ValidateIf((o) => o.deliveryMode !== DeliveryMode.ON_SITE)
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @Transform(emptyStringToUndefined)
  @ValidateIf((o) => o.deliveryMode !== DeliveryMode.ON_SITE)
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @Transform(emptyStringToUndefined)
  @ValidateIf((o) => o.deliveryMode !== DeliveryMode.ON_SITE)
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  addressLineOne: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  addressLineTwo: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  practitionerId: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'Quantity must be greater than 0' })
  quantity: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEnum([...Object.values(ClientType)])
  clientType: string;

  @ApiPropertyOptional()
  @IsEnum([...Object.values(KitType)])
  @IsString()
  @IsOptional()
  kitType: string;

  @ApiProperty({ enum: Currency })
  @IsEnum(Currency)
  @IsNotEmpty()
  currency: Currency;

  @ApiPropertyOptional({ enum: DeliveryMode })
  @IsEnum(DeliveryMode)
  @IsString()
  @IsOptional()
  deliveryMode?: DeliveryMode;

  userId: string;

  subPractitionerName: string;

  public toEntity(payload: SaveOrderDto, source: string, referenceId: string) {
    const data = new Order();
    data.referenceId = referenceId;
    if (payload.country)
      data.country = [AllowedCountries.US, AllowedCountriesAbbrev.US].includes(
        payload.country as AllowedCountries | AllowedCountriesAbbrev,
      )
        ? AllowedCountriesAbbrev.US
        : AllowedCountriesAbbrev.CA;
    data.email = payload.email;
    data.firstName = payload.firstName;
    data.lastName = payload.lastName;
    data.addressLineOne = payload.addressLineOne;
    data.addressLineTwo = payload.addressLineTwo;
    data.city = payload.city;
    data.postalCode = payload.postalCode;
    data.state = payload.state;
    data.userId = payload.userId;
    data.subPractitionerName = payload.subPractitionerName;
    data.source = source;
    data.status = OrderStatus.Paid;
    data.currency = payload.currency;
    if (payload.kitType) data.kitType = payload.kitType;
    if (payload.quantity) data.quantity = payload.quantity;
    if (payload.deliveryMode) data.deliveryMode = payload.deliveryMode;
    data.completedAt = DateTime.local().toJSDate();
    return data;
  }
}
