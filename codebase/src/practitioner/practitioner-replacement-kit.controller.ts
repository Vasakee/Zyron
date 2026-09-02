import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SentryInterceptor } from 'src/sentry/sentry.interceptor';
import { ThrottlerGuard } from '@nestjs/throttler';
import {
  SuccessResponseType,
  successResponse,
  CustomRequest,
} from 'src/common/utils';
import { KitReplacementRequest } from 'src/replacement-kit/entity/kit-replacement-request.entity';
import { ReplacementKitCheckoutService } from 'src/replacement-kit/services/replacement-kit-checkout.service';
import { ReplacementKitTargetType } from 'src/enum';

@UseGuards(ThrottlerGuard)
@UseInterceptors(SentryInterceptor)
@Controller('practitioner/replacement-kit-requests')
export class PractitionerReplacementKitController {
  constructor(
    @InjectRepository(KitReplacementRequest)
    private readonly kitReplacementRepo: Repository<KitReplacementRequest>,
    private readonly replacementKitCheckoutService: ReplacementKitCheckoutService,
  ) {}

  @Get('')
  @HttpCode(200)
  async list(@Req() req: CustomRequest): Promise<SuccessResponseType> {
    const practitionerId = req.user.id;
    const items = await this.replacementKitCheckoutService.listForPractitioner(
      practitionerId,
    );

    return successResponse({
      message: 'Replacement kit requests fetched',
      code: HttpStatus.OK,
      data: items,
      status: 'success',
    });
  }

  @Post(':id/pay')
  @HttpCode(200)
  async pay(
    @Param('id') id: string,
    @Req() req: CustomRequest,
  ): Promise<SuccessResponseType> {
    const practitionerId = req.user.id;
    const result = await this.replacementKitCheckoutService.createCheckoutLink(
      id,
      { practitionerId },
    );

    return successResponse({
      message: 'Checkout link generated',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }
}
