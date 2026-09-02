import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  HttpStatus,
  Param,
  Delete,
  Put,
  Patch,
  Query,
  UseInterceptors,
  UseGuards,
  Req,
  Headers,
} from '@nestjs/common';
import {
  CustomRequest,
  SuccessResponseType,
  successResponse,
} from 'src/common/utils';
import { CreateOrderService } from './service/create-order';
import {
  OrdersQueryDto,
  OrderDto,
  SaveOrderDto,
  ConsentAcceptanceDto,
} from './dto/create-order.dto';
import { DeleteOrdersService } from './service/delete-order';
import { ConsentAcceptanceService } from './service/consent-acceptance.service';
import { GetAllOrderService } from './service/get-orders';
import { PageOptionsDto } from 'src/common';
import { SentryInterceptor } from 'src/sentry/sentry.interceptor';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GetPaidOrderService } from './service/get-paid-orders';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderService } from './service/update-order';
import { GetPractitionerOrderService } from './service/get-practitioner-orders';
import { GetWebsiteOrdersService } from './service/get-website-orders';
import { UpdateWebsiteOrderService } from './service/update-website-order';
import { UpdateShippingDto } from './dto/website-order.dto';
import { PayOrderService } from './service/pay-order';
import { OrdersKitQueryDto } from './dto/create-order-kit.dto';
import { SaveOrderService } from './service/save-order';
import { GetOrderKitService } from './service/get-orders-kit';
import { ShotgunWaitlistService } from './service/shotgun-waitlist';
import {
  PaymentLinkTestDto,
  ShotgunWaitlistDto,
} from './dto/shotgun-waitlist.dto';
import { ReminderService } from './service/waitlist-reminder';
import { GetWaitlistOrderService } from './service/get-waitlist-orders';
import { GetPractitionerWaitlistOrderService } from './service/get-practitioner-waitlist-orders';
import { ApiTags } from '@nestjs/swagger';
import { AccountRoles, OrderType } from 'src/enum';
import { CheckPaymentMethodAvailabilityService } from './service/check-payment-method-availability';
import { MonthlyBillingAccessGuard } from './guards/monthly-billing-access.guard';
import { RetrieveCheckoutSessionService } from 'src/payment/services/retrieve-checkout-session.service';
import { CancelOrderService } from './service/cancel-order.service';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@UseGuards(ThrottlerGuard)
@UseInterceptors(SentryInterceptor)
@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly createOrderService: CreateOrderService,
    private readonly updateOrderService: UpdateOrderService,
    private readonly getWebsiteOrdersService: GetWebsiteOrdersService,
    private readonly deleteOrderService: DeleteOrdersService,
    private readonly getAllOrderService: GetAllOrderService,
    private readonly getPaidOrderService: GetPaidOrderService,
    private readonly getPractitionerOrderService: GetPractitionerOrderService,
    private readonly updateWebsiteOrderService: UpdateWebsiteOrderService,
    private readonly payOrderService: PayOrderService,
    private readonly getKitOrderService: GetOrderKitService,
    private readonly saveOrderService: SaveOrderService,
    private readonly waitlistService: ShotgunWaitlistService,
    private readonly reminderService: ReminderService,
    private readonly getWaitlistOrderService: GetWaitlistOrderService,
    private readonly getPractitionerWaitlistOrderService: GetPractitionerWaitlistOrderService,
    private readonly consentAcceptanceService: ConsentAcceptanceService,
    private readonly checkPaymentMethodAvailabilityService: CheckPaymentMethodAvailabilityService,
    private readonly retrieveCheckoutSessionService: RetrieveCheckoutSessionService,
    private readonly cancelOrderService: CancelOrderService,
  ) {}

  @Post('')
  @HttpCode(201)
  @UseGuards(MonthlyBillingAccessGuard)
  async createOrder(
    @Body() data: OrderDto,
    @Req() req: CustomRequest,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    data.userId = req.user.id;
    data.userName = `${req.user.firstName} ${req.user.lastName}`;
    const result = await this.createOrderService.execute(data, data.orderType);

    const orderTypeMessages = {
      [OrderType.KitOnSite]: 'Kit on-site order was created successfully',
      [OrderType.MonthlyBilling]:
        'Monthly billing order was created successfully',
      [OrderType.PayAsYouGo]: 'Pay-as-you-go order was created successfully',
    };

    return successResponse({
      message:
        orderTypeMessages[data.orderType] || 'Order was created successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'created',
    });
  }

  @Get('send-reminders')
  @HttpCode(200)
  async triggerReminders() {
    await this.reminderService.sendReminderEmails();
    return { message: 'Reminders sent successfully' };
  }
  @Post('save')
  @HttpCode(201)
  async saveOrder(
    @Body() data: SaveOrderDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.saveOrderService.execute(data);
    return successResponse({
      message: 'Order was saved successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'created',
    });
  }
  @Get('/')
  @HttpCode(200)
  async getAllOrders(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() query: OrdersQueryDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.getAllOrderService.execute(
      pageOptionsDto,
      query,
      query.orderType,
    );
    return successResponse({
      message: 'Orders  was fetched successfully',

      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Get('customer-orders')
  @HttpCode(200)
  async getAllShippings(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() query: OrdersQueryDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.getWebsiteOrdersService.execute(
      pageOptionsDto,
      query,
    );
    return successResponse({
      message: 'Customer orders were fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Get('waitlist-orders')
  @HttpCode(200)
  async getWaitlistOrder(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() query: OrdersQueryDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.getWaitlistOrderService.execute(
      pageOptionsDto,
      query,
    );
    return successResponse({
      message: 'Waitlist orders were fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Get('order-kits/:orderId')
  @HttpCode(200)
  async getAllKitOrder(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() query: OrdersKitQueryDto,
    @Param('orderId') orderId: string,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.getKitOrderService.execute(
      orderId,
      pageOptionsDto,
      query,
    );
    return successResponse({
      message: 'Order kits were fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Get('/paidOrder')
  @HttpCode(200)
  async getPaidOrder(
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.getPaidOrderService.execute();
    return successResponse({
      message: ' Order discrepancies was fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Delete(':id')
  @HttpCode(200)
  async deleteSingleOrder(
    @Param('id') id: string,
  ): Promise<SuccessResponseType> {
    const result = await this.deleteOrderService.execute(id);
    return successResponse({
      message: 'Order was deleted successfully',

      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Put(':id')
  @HttpCode(200)
  async updateOrder(
    @Param('id') id: string,
    @Body() data: UpdateOrderDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.updateOrderService.execute(id, data);
    return successResponse({
      message: 'Order was updated successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Patch(':id/cancel')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles(AccountRoles.ADMIN)
  async cancelOrder(
    @Param('id') id: string,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.cancelOrderService.execute(id);
    return successResponse({
      message: 'Order was cancelled successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Get('/pending-order/:id')
  @HttpCode(200)
  async getUnPaidOrder(
    @Param('id') id: string,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.payOrderService.execute(id);
    return successResponse({
      message: ' Payment link generated successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Get('practitioner-orders')
  @HttpCode(200)
  async getOrders(
    @Req() req: CustomRequest,
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() query: OrdersQueryDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.getPractitionerOrderService.execute(
      req.user.id,
      pageOptionsDto,
      query,
      query.orderType,
    );
    return successResponse({
      message: 'Orders were fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Get('practitioner-waitlist-orders')
  @HttpCode(200)
  async getPractitionerWaitlistOrder(
    @Req() req: CustomRequest,
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() query: OrdersQueryDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.getPractitionerWaitlistOrderService.execute(
      req.user.id,
      pageOptionsDto,
      query,
    );
    return successResponse({
      message: 'Orders were fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Put('shipping/:id')
  @HttpCode(200)
  async updateShipping(
    @Param('id') id: string,
    @Body() data: UpdateShippingDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.updateWebsiteOrderService.execute(id, data);
    return successResponse({
      message: 'Shipping was updated successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Post('/waitlist')
  @HttpCode(201)
  async joinWaitlist(
    @Body() data: ShotgunWaitlistDto,
    @Req() req: CustomRequest,
  ): Promise<SuccessResponseType> {
    const result = await this.waitlistService.execute(data);
    return successResponse({
      message: 'Form was sent successfully, waitlist joined',
      code: HttpStatus.OK,
      data: result,
      status: 'created',
    });
  }

  @Post('/complete-waitlist-payment')
  @HttpCode(201)
  async testPaymentLink(
    @Body() data: PaymentLinkTestDto,
  ): Promise<SuccessResponseType> {
    const result = await this.reminderService.generateSecondPaymentLink(
      data.orderId,
    );
    return successResponse({
      message: 'Payment generated successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'created',
    });
  }

  @Post('/consent-acceptance')
  @HttpCode(201)
  async consentAcceptance(
    @Body() data: ConsentAcceptanceDto,
  ): Promise<SuccessResponseType> {
    const result = await this.consentAcceptanceService.execute(data);
    return successResponse({
      message: 'Consent accepted and payment method saved successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Get('/consent-decision/:sessionId')
  @HttpCode(200)
  async consentDecision(
    @Param('sessionId') sessionId: string,
  ): Promise<SuccessResponseType> {
    const [consentResult, session] = await Promise.all([
      this.checkPaymentMethodAvailabilityService.execute(sessionId),
      this.retrieveCheckoutSessionService.execute(sessionId),
    ]);

    return successResponse({
      message:
        'Consent decision and session verification completed successfully',
      code: HttpStatus.OK,
      data: {
        ...consentResult,
        session: {
          sessionId: session.id,
          status: session.status,
          paymentStatus: session.payment_status,
          customer: session.customer,
          amountTotal: session.amount_total,
          currency: session.currency,
        },
      },
      status: 'success',
    });
  }
}
