import {
  ApiProperty,
  ApiPropertyOptional,
  ApiHideProperty,
} from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  OrderType,
  Currency,
  StripeInvoiceStatus,
  PaymentStatementStatus,
  PaymentStatementQueryStatus,
} from 'src/enum';
import { PageMetaDto } from 'src/common';

export class ReportingQueryDto {
  @ApiPropertyOptional({
    description:
      'ISO date (UTC). Overlap semantics with periodStart/periodEnd.',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description:
      'ISO date (UTC). Overlap semantics with periodStart/periodEnd.',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  practitionerId?: string;

  @ApiPropertyOptional({
    description: 'Item currency filter (e.g., usd, cad).',
  })
  @IsOptional()
  @IsEnum([...Object.values(Currency)])
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum([...Object.values(OrderType)])
  orderType?: string;
}

export class PaymentStatementQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  paidAtStart?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  paidAtEnd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  createdAtStart?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  createdAtEnd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  interval?: string;

  @ApiPropertyOptional({
    description: 'Limit number of results (1-1000)',
    minimum: 1,
    maximum: 1000,
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number;
}

export class OrderReportDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  referenceId: string;

  @ApiProperty()
  practitionerId: string;

  @ApiProperty()
  practitionerName: string;

  @ApiProperty()
  orderType: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  amountSubtotal: number;

  @ApiProperty()
  amountDiscount: number;

  @ApiProperty()
  amountTax: number;

  @ApiProperty()
  amountTotal: number;

  @ApiProperty()
  promotionCode: string;

  @ApiProperty()
  promotionCodeId: string;

  @ApiProperty()
  invoiceId: string;

  @ApiProperty()
  invoiceNumber: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  completedAt: Date;
}

export class TransactionReportDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  referenceId: string;

  @ApiProperty()
  practitionerId: string;

  @ApiProperty()
  practitionerName: string;

  @ApiProperty()
  orderReferenceId: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  gateway: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  invoiceId: string;

  @ApiProperty()
  invoiceNumber: string;

  @ApiProperty()
  paymentIntentId: string;

  @ApiProperty()
  promotionCodeId: string;

  @ApiProperty()
  paidAt: Date;

  @ApiProperty()
  createdAt: Date;
}

export class MonthlyStatementQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  year?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @Min(1)
  @Max(12)
  month?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(PaymentStatementQueryStatus)
  @Transform(({ value }) => (value === '' ? undefined : value))
  status?: PaymentStatementQueryStatus;
}

export class CurrencyTotalDto {
  @ApiProperty()
  currency: string;

  @ApiProperty({ description: 'Major units (e.g., dollars).' })
  amount: number;

  @ApiProperty({ description: 'Minor units (e.g., cents).' })
  subAmount: number;
}

export class StatementItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty({ description: 'Minor units (e.g., cents).' })
  unitAmount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  clientName: string;

  @ApiProperty()
  clientEmail: string;
}

export class MonthlyStatementDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  practitionerId: string;

  @ApiProperty()
  interval: string;

  @ApiProperty()
  periodStart: Date;

  @ApiProperty()
  periodEnd: Date;

  @ApiPropertyOptional()
  invoiceId?: string | null;

  @ApiPropertyOptional()
  invoiceNumber?: string | null;

  @ApiPropertyOptional()
  invoiceUrl?: string | null;

  @ApiPropertyOptional()
  invoicePdf?: string | null;

  @ApiProperty({ enum: PaymentStatementStatus })
  status: PaymentStatementStatus;

  @ApiPropertyOptional({ enum: StripeInvoiceStatus })
  invoiceStatus?: StripeInvoiceStatus | null;

  @ApiPropertyOptional()
  paidAt?: Date | null;

  @ApiProperty({ type: [StatementItemDto] })
  statementItems: StatementItemDto[];

  @ApiProperty({ type: [CurrencyTotalDto] })
  currencyTotals: CurrencyTotalDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({
    description:
      'Label year based on business cycle (e.g., periodEnd - 1 day in America/New_York).',
  })
  labelYear: number;

  @ApiProperty({ description: '1-12. Label month based on business cycle.' })
  labelMonth: number;

  @ApiPropertyOptional({ deprecated: true })
  currency?: string | null;

  @ApiHideProperty()
  amountSubtotal?: number | null;

  @ApiHideProperty()
  amountDiscount?: number | null;

  @ApiHideProperty()
  amountTax?: number | null;

  @ApiHideProperty()
  amountTotal?: number | null;
}

export class MonthlyStatementAdminDto extends MonthlyStatementDto {
  @ApiPropertyOptional({
    description:
      'Stripe snapshot subtotal (minor units). Returned only for admin/internal.',
  })
  amountSubtotal?: number | null;

  @ApiPropertyOptional({
    description:
      'Stripe snapshot discount (minor units). Returned only for admin/internal.',
  })
  amountDiscount?: number | null;

  @ApiPropertyOptional({
    description:
      'Stripe snapshot tax (minor units). Returned only for admin/internal.',
  })
  amountTax?: number | null;

  @ApiPropertyOptional({
    description:
      'Stripe snapshot total (minor units). Returned only for admin/internal.',
  })
  amountTotal?: number | null;
}

export class StatementReportDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  practitionerId: string;

  @ApiProperty()
  practitionerName: string;

  @ApiProperty()
  practitionerEmail: string;

  @ApiProperty()
  interval: string;

  @ApiProperty()
  periodStart: Date;

  @ApiProperty()
  periodEnd: Date;

  @ApiPropertyOptional()
  invoiceId?: string | null;

  @ApiPropertyOptional()
  invoiceNumber?: string | null;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional({ deprecated: true })
  amountSubtotal?: number | null;

  @ApiPropertyOptional({ deprecated: true })
  amountDiscount?: number | null;

  @ApiPropertyOptional({ deprecated: true })
  amountTax?: number | null;

  @ApiPropertyOptional({ deprecated: true })
  amountTotal?: number | null;

  @ApiPropertyOptional()
  paidAt?: Date | null;

  @ApiProperty()
  orderCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: [CurrencyTotalDto] })
  currencyTotals: CurrencyTotalDto[];

  @ApiProperty({ description: 'Label year based on business cycle.' })
  labelYear: number;

  @ApiProperty({ description: '1-12. Label month based on business cycle.' })
  labelMonth: number;

  @ApiPropertyOptional({ deprecated: true })
  currency?: string | null;
}

class MonthlyStatementStatisticsItemDto {
  @ApiProperty()
  count: number;

  @ApiProperty({ type: [CurrencyTotalDto] })
  currencyTotals: CurrencyTotalDto[];
}

class MonthlyStatementStatisticsDto {
  @ApiProperty({ type: MonthlyStatementStatisticsItemDto })
  all: MonthlyStatementStatisticsItemDto;

  @ApiProperty({ type: MonthlyStatementStatisticsItemDto })
  paid: MonthlyStatementStatisticsItemDto;

  @ApiProperty({ type: MonthlyStatementStatisticsItemDto })
  rest: MonthlyStatementStatisticsItemDto;
}

export class MonthlyStatementWithStatsDto {
  @ApiProperty({ type: [MonthlyStatementDto] })
  result: MonthlyStatementDto[];

  @ApiProperty({ type: PageMetaDto })
  pageMetaDto: PageMetaDto;

  @ApiProperty({ type: MonthlyStatementStatisticsDto })
  statistics: MonthlyStatementStatisticsDto;
}

export class AmountDto {
  @ApiProperty()
  amountInCents: number;

  @ApiProperty()
  actualAmount: number;
}

export class CurrencyAmountDto {
  @ApiProperty()
  currency: string;

  @ApiProperty()
  amountInCents: number;

  @ApiProperty()
  actualAmount: number;
}

export class PaymentStatementStatusBreakdownDto {
  @ApiProperty()
  status: string;

  @ApiProperty()
  count: number;

  @ApiProperty({ type: [CurrencyAmountDto] })
  amounts: CurrencyAmountDto[];

  @ApiProperty()
  percentage: number;
}

export class PaymentStatementCurrencyBreakdownDto {
  @ApiProperty()
  currency: string;

  @ApiProperty()
  count: number;

  @ApiProperty()
  amountInCents: number;

  @ApiProperty()
  actualAmount: number;
}

export class PaymentStatementIntervalBreakdownDto {
  @ApiProperty()
  interval: string;

  @ApiProperty()
  count: number;

  @ApiProperty({ type: [CurrencyAmountDto] })
  amounts: CurrencyAmountDto[];
}

export class PaymentStatementAveragesDto {
  @ApiProperty({ type: [CurrencyAmountDto] })
  averageAmounts: CurrencyAmountDto[];

  @ApiProperty({ type: [CurrencyAmountDto] })
  medianAmounts: CurrencyAmountDto[];

  @ApiProperty()
  averageItemCount: number;

  @ApiProperty()
  averageAttemptCount: number;
}

export class PaymentStatementRetryMetricsDto {
  @ApiProperty()
  totalStatements: number;

  @ApiProperty()
  statementsWithRetries: number;

  @ApiProperty()
  retryRate: number;

  @ApiProperty()
  averageRetryCount: number;

  @ApiProperty()
  maxRetryCount: number;
}

export class PaymentStatementStatisticsDto {
  @ApiProperty()
  totalStatements: number;

  @ApiProperty({ type: [CurrencyAmountDto] })
  totalAmounts: CurrencyAmountDto[];

  @ApiProperty({ type: [CurrencyAmountDto] })
  totalPaid: CurrencyAmountDto[];

  @ApiProperty({ type: [CurrencyAmountDto] })
  totalFailed: CurrencyAmountDto[];

  @ApiProperty({ type: [CurrencyAmountDto] })
  totalPending: CurrencyAmountDto[];

  @ApiProperty()
  paidPercentage: number;

  @ApiProperty()
  failureRate: number;

  @ApiProperty({ type: [PaymentStatementStatusBreakdownDto] })
  statusBreakdown: PaymentStatementStatusBreakdownDto[];

  @ApiProperty({ type: [PaymentStatementCurrencyBreakdownDto] })
  currencyBreakdown: PaymentStatementCurrencyBreakdownDto[];

  @ApiProperty({ type: [PaymentStatementIntervalBreakdownDto] })
  intervalBreakdown: PaymentStatementIntervalBreakdownDto[];

  @ApiProperty({ type: PaymentStatementAveragesDto })
  averages: PaymentStatementAveragesDto;

  @ApiProperty({ type: PaymentStatementRetryMetricsDto })
  retryMetrics: PaymentStatementRetryMetricsDto;

  @ApiProperty()
  dateRange: {
    start: Date;
    end: Date;
  };
}
