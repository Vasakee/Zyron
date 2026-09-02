import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Headers,
  UseInterceptors,
  Get,
  Req,
  Delete,
  Param,
} from '@nestjs/common';
import { PaymentWebhookService } from '../services/payment-webhook';
import { SentryInterceptor } from 'src/sentry/sentry.interceptor';
import {
  CustomRequest,
  SuccessResponseType,
  successResponse,
} from 'src/common/utils';
import { PaymentDto } from '../dto/payment.dto';
import { GetPaymnetMethodService } from '../services/get-payment-methods';
import { chargePaymentMethodService as ChargePaymentMethodService } from '../services/charge-payment-method';
import { DeletePaymentMethodService } from '../services/delete-payment-method.service';
import { UpdateDefaultPaymentMethodService } from '../services/update-default-payment-method.service';
import { CreateSetupIntentService } from '../services/create-setup-intent.service';
import { ConfirmPaymentMethodService } from '../services/confirm-payment-method.service';
import { ConfirmPaymentMethodDto } from '../dto/confirm-payment-method.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GuestCheckoutService } from '../services/guest-checkout.service';
import { GuestCheckoutDto } from '../dto/guest-checkout.dto';

@UseInterceptors(SentryInterceptor)
@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentWebhookService: PaymentWebhookService,
    private readonly getPaymnetMethodService: GetPaymnetMethodService,
    private readonly chargePaymentMethodService: ChargePaymentMethodService,
    private readonly deletePaymentMethodService: DeletePaymentMethodService,
    private readonly updateDefaultPaymentMethodService: UpdateDefaultPaymentMethodService,
    private readonly createSetupIntentService: CreateSetupIntentService,
    private readonly confirmPaymentMethodService: ConfirmPaymentMethodService,
    private readonly guestCheckoutService: GuestCheckoutService,
  ) {}

  @Post('webhook')
  @HttpCode(200)
  async paymentWebhook(
    @Headers('stripe-signature') signature: string,
    @Body() data: any,
  ): Promise<SuccessResponseType> {
    await this.paymentWebhookService.execute(data, signature);
    return successResponse({
      message: 'successfully',
      code: HttpStatus.OK,
    });
  }

  @ApiOperation({
    summary: 'Create guest checkout session (no auth, no email required)',
  })
  @Post('checkout/guest')
  @HttpCode(200)
  async guestCheckout(
    @Body() data: GuestCheckoutDto,
  ): Promise<SuccessResponseType> {
    const result = await this.guestCheckoutService.execute({
      kitType: data.kitType,
      currency: data.currency,
      quantity: data.quantity,
      successUrl: data.successUrl,
      cancelUrl: data.cancelUrl,
      isPreOrder: data.isPreOrder ?? false,
    });

    return successResponse({
      message: 'Checkout session created successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Post('charge-payment-method')
  @HttpCode(200)
  async paymentMethod(
    @Headers('x-access-token') token: string,
    @Req() req: CustomRequest,
    @Body() data: PaymentDto,
  ): Promise<SuccessResponseType> {
    await this.chargePaymentMethodService.execute(
      data.firstName,
      data.lastName,
      req.user.id,
      data.kitType,
      data.paymentMethodId,
      data.country,
      data.quantity,
      undefined,
      data.isPreOrder,
    );
    return successResponse({
      message: 'successful',
      code: HttpStatus.OK,
    });
  }

  @Get('payment-methods')
  @HttpCode(200)
  async getPaymentMethods(
    @Headers('x-access-token') token: string,
    @Req() req: CustomRequest,
  ) {
    const result = await this.getPaymnetMethodService.execute(req.user.id);
    return successResponse({
      message: 'Payment methods was fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Delete('payment-methods/:id')
  @HttpCode(200)
  async deletePaymentMethod(
    @Param('id') paymentMethodId: string,
    @Headers('x-access-token') token: string,
    @Req() req: CustomRequest,
  ): Promise<SuccessResponseType> {
    const result = await this.deletePaymentMethodService.execute(
      paymentMethodId,
      req.user.id,
    );
    return successResponse({
      message: result.message,
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Post('payment-methods/:id/set-default')
  @HttpCode(200)
  async updateDefaultPaymentMethod(
    @Param('id') paymentMethodId: string,
    @Headers('x-access-token') token: string,
    @Req() req: CustomRequest,
  ): Promise<SuccessResponseType> {
    const result = await this.updateDefaultPaymentMethodService.execute(
      paymentMethodId,
      req.user.id,
    );
    return successResponse({
      message: result.message,
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @ApiOperation({ summary: 'Create setup intent for card collection' })
  @ApiResponse({
    status: 200,
    description: 'Setup intent created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'User not found or missing Stripe customer ID',
  })
  @Post('setup-intent')
  @HttpCode(200)
  async createSetupIntent(
    @Headers('x-access-token') token: string,
    @Req() req: CustomRequest,
  ): Promise<SuccessResponseType> {
    const result = await this.createSetupIntentService.execute(req.user.id);
    return successResponse({
      message: 'Setup intent created successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @ApiOperation({
    summary: 'Confirm and save payment method from setup intent',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment method saved and set as default successfully',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid setup intent, payment method already saved, or other validation error',
  })
  @Post('payment-methods/confirm')
  @HttpCode(200)
  async confirmPaymentMethod(
    @Headers('x-access-token') token: string,
    @Req() req: CustomRequest,
    @Body() data: ConfirmPaymentMethodDto,
  ): Promise<SuccessResponseType> {
    const result = await this.confirmPaymentMethodService.execute(
      req.user.id,
      data.setupIntentId,
      data.setAsDefault,
    );
    return successResponse({
      message: result.message,
      code: HttpStatus.OK,
      data: result.paymentMethod,
      status: 'success',
    });
  }
}
