import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseInterceptors,
  UseGuards,
  Headers,
  Req,
} from '@nestjs/common';
import {
  CustomRequest,
  SuccessResponseType,
  successResponse,
} from 'src/common/utils';
import {
  ReportingQueryDto,
  PaymentStatementQueryDto,
  MonthlyStatementQueryDto,
  MonthlyStatementWithStatsDto,
  PaymentStatementStatisticsDto,
} from './dto/reporting.dto';
import { OrderReportingService } from './service/order-reporting.service';
import { TransactionReportingService } from './service/transaction-reporting.service';
import { StatementReportingService } from './service/statement-reporting.service';
import { PaymentStatementService } from './service/payment-statement.service';
import { PageOptionsDto } from 'src/common';
import { SentryInterceptor } from 'src/sentry/sentry.interceptor';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

@UseGuards(ThrottlerGuard, RolesGuard)
@UseInterceptors(SentryInterceptor)
@ApiTags('Reporting')
@Controller('reporting')
export class ReportingController {
  constructor(
    private readonly orderReportingService: OrderReportingService,
    private readonly transactionReportingService: TransactionReportingService,
    private readonly statementReportingService: StatementReportingService,
    private readonly paymentStatementService: PaymentStatementService,
  ) {}

  // Order Reports
  @Get('orders')
  @HttpCode(200)
  @Roles('admin')
  async getOrderReport(
    @Query() pageOptionsDto: PageOptionsDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.orderReportingService.getOrderReport(
      pageOptionsDto,
    );
    return successResponse({
      message: 'Order report fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Get('orders/summary')
  @HttpCode(200)
  @Roles('admin')
  async getOrderSummary(
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.orderReportingService.getOrderSummary();
    return successResponse({
      message: 'Order summary fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  // Transaction Reports
  @Get('transactions')
  @HttpCode(200)
  @Roles('admin')
  async getTransactionReport(
    @Query() pageOptionsDto: PageOptionsDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.transactionReportingService.getTransactionReport(
      pageOptionsDto,
    );
    return successResponse({
      message: 'Transaction report fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Get('transactions/reconciliation')
  @HttpCode(200)
  @Roles('admin')
  async getTransactionReconciliation(
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result =
      await this.transactionReportingService.getTransactionReconciliation();
    return successResponse({
      message: 'Transaction reconciliation fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Get('transactions/summary')
  @HttpCode(200)
  @Roles('admin')
  async getTransactionSummary(
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result =
      await this.transactionReportingService.getTransactionSummary();
    return successResponse({
      message: 'Transaction summary fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  // Statement Reports
  @Get('statements')
  @HttpCode(200)
  @Roles('admin')
  async getStatementReport(
    @Query() pageOptionsDto: PageOptionsDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.statementReportingService.getStatementReport(
      pageOptionsDto,
    );
    return successResponse({
      message: 'Statement report fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Get('statements/rollup/practitioner')
  @HttpCode(200)
  @Roles('admin')
  async getStatementRollupByPractitioner(
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result =
      await this.statementReportingService.getStatementRollupByPractitioner();
    return successResponse({
      message: 'Statement rollup by practitioner fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Get('statements/rollup/month')
  @HttpCode(200)
  @Roles('admin')
  async getStatementRollupByMonth(
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result =
      await this.statementReportingService.getStatementRollupByMonth();
    return successResponse({
      message: 'Statement rollup by month fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Get('statements/rollup/currency')
  @HttpCode(200)
  @Roles('admin')
  async getStatementRollupByCurrency(
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result =
      await this.statementReportingService.getStatementRollupByCurrency();
    return successResponse({
      message: 'Statement rollup by currency fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  // Payment Statement Reports
  @Get('payment-statements')
  @HttpCode(200)
  @Roles('admin')
  async getPaymentStatements(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() query: PaymentStatementQueryDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.paymentStatementService.getPaymentStatements(
      pageOptionsDto,
      query,
    );
    return successResponse({
      message: 'Payment statements fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Get('payment-statements/summary')
  @HttpCode(200)
  @Roles('admin')
  async getPaymentStatementSummary(
    @Query() query: PaymentStatementQueryDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result =
      await this.paymentStatementService.getPaymentStatementSummary(query);
    return successResponse({
      message: 'Payment statement summary fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Get('payment-statements/status-summary')
  @HttpCode(200)
  @Roles('admin')
  async getPaymentStatementStatusSummary(
    @Query() query: PaymentStatementQueryDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result =
      await this.paymentStatementService.getPaymentStatementStatusSummary(
        query,
      );
    return successResponse({
      message: 'Payment statement status summary fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Get('payment-statements/statistics')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Payment statement statistics fetched successfully',
    type: PaymentStatementStatisticsDto,
  })
  async getPaymentStatementStatistics(
    @Query() query: PaymentStatementQueryDto,
  ): Promise<SuccessResponseType> {
    const result =
      await this.paymentStatementService.getPaymentStatementStatistics(query);
    return successResponse({
      message: 'Payment statement statistics fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  // Monthly Statements
  @Get('admin/monthly-statements')
  @HttpCode(200)
  @Roles('admin')
  @ApiResponse({ type: MonthlyStatementWithStatsDto })
  async getMonthlyStatementsForAdmin(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() query: MonthlyStatementQueryDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result =
      await this.statementReportingService.getMonthlyStatementsForAdmin(
        pageOptionsDto,
        query,
      );
    return successResponse({
      message: 'Monthly statements for admin fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Get('practitioner/monthly-statements')
  @HttpCode(200)
  @Roles('user', 'practitioner', 'admin')
  @ApiResponse({ type: MonthlyStatementWithStatsDto })
  async getMonthlyStatementsForPractitioner(
    @Req() req: CustomRequest,
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() query: MonthlyStatementQueryDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result =
      await this.statementReportingService.getMonthlyStatementsForPractitioner(
        req.user.id,
        pageOptionsDto,
        query,
      );
    return successResponse({
      message: 'Monthly statements for practitioner fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }
}
