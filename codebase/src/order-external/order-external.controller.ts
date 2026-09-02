import {
  Body,
  Controller,
  HttpCode,
  Post,
  HttpStatus,
  UseInterceptors,
  UseGuards,
  Req,
  Headers,
  Get,
  Query,
} from '@nestjs/common';
import {
  CustomRequest,
  SuccessResponseType,
  successResponse,
} from 'src/common/utils';
import { SentryInterceptor } from 'src/sentry/sentry.interceptor';
import { ThrottlerGuard } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiHeader,
  ApiQuery,
} from '@nestjs/swagger';
import { SaveOrderExternalDto } from './dto/save-order-external.dto';
import { SaveOrderExternalService } from './services/save-order-external';
import { PageOptionsDto } from 'src/common';
import { GetOrdersExternalService } from './services/get-orders-external';
import { OrdersQueryDto } from 'src/order/dto/create-order.dto';

@UseGuards(ThrottlerGuard)
@UseInterceptors(SentryInterceptor)
@ApiTags('Orders')
@Controller('external/orders')
export class OrdersExternalController {
  constructor(
    private readonly saveOrderExternalService: SaveOrderExternalService,
    private readonly getOrdersExternalService: GetOrdersExternalService,
  ) {}

  @Post('')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Create a new external order',
    description:
      'Creates an order from external systems like Stripe or partner platforms.\n' +
      'Set `usePractitionerAccount` to true only if this order should be tied to an existing practitioner account. ' +
      'If so, `practitionerEmail` must be provided. Only US and CA are supported countries.\n' +
  '\n' +
  '`kitType` must be one of the following: `gut-scan`, `deep-gut`, `deep-gut-plus`.',
  })
  @ApiBearerAuth()
  @ApiHeader({
    name: 'x-access-token',
    description: 'Access token for authentication',
    required: true,
  })
  async createOrder(
    @Body() data: SaveOrderExternalDto,
    @Req() req: CustomRequest,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    data.username = req.user.username;
    const result = await this.saveOrderExternalService.execute(data);
    return successResponse({
      message: 'Order was created successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'created',
    });
  }

  @Get('')
  @ApiOperation({
    summary: 'Get external orders (Elyxium)',
    description:
      'Retrieves all orders created from Elyxium integration. Supports pagination, status filtering, and search by name.',
  })
  @ApiBearerAuth()
  @ApiQuery({ name: 'searchQuery', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getOrders(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() query: OrdersQueryDto,
  ): Promise<SuccessResponseType> {
    const result = await this.getOrdersExternalService.execute(
      pageOptionsDto,
      query,
    );

    return successResponse({
      message: 'Orders fetched successfully',
      code: HttpStatus.OK,
      data: result,
    });
  }
}
