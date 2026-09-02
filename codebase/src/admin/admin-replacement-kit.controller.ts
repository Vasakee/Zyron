import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseInterceptors,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { SentryInterceptor } from 'src/sentry/sentry.interceptor';
import { ThrottlerGuard } from '@nestjs/throttler';
import { successResponse, CustomRequest } from 'src/common/utils';
import { ReplacementKitRequestService } from 'src/replacement-kit/services/replacement-kit-request.service';
import { CreateReplacementKitRequestDto } from 'src/replacement-kit/dto/create-replacement-kit-request.dto';
import { AccountRoles, ReplacementKitStatus } from 'src/enum';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import {
  ReplacementKitRequestCreateResponseDto,
  ReplacementKitRequestListResponseDto,
} from './dto/admin-replacement-kit.dto';
import { toReplacementKitRequestResponse } from 'src/replacement-kit/transformers/kit-replacement-request.transformer';

@UseGuards(ThrottlerGuard, RolesGuard)
@Roles(AccountRoles.ADMIN, AccountRoles.SUPER_ADMIN)
@UseInterceptors(SentryInterceptor)
@ApiTags('Admin Replacement Kit Requests')
@Controller('admin/replacement-kit-requests')
export class AdminReplacementKitController {
  constructor(
    private readonly replacementKitRequestService: ReplacementKitRequestService,
  ) {}

  @Post('')
  @HttpCode(201)
  @ApiCreatedResponse({ type: ReplacementKitRequestCreateResponseDto })
  async create(
    @Body() dto: CreateReplacementKitRequestDto,
    @Req() req: CustomRequest,
  ): Promise<ReplacementKitRequestCreateResponseDto> {
    const created = await this.replacementKitRequestService.create(
      dto,
      req.user.id,
    );
    return successResponse({
      message: 'Replacement kit request created',
      code: HttpStatus.CREATED,
      data: toReplacementKitRequestResponse(created),
      status: 'created',
    });
  }

  @Get('')
  @HttpCode(200)
  @ApiQuery({ name: 'status', required: false, enum: ReplacementKitStatus })
  @ApiOkResponse({ type: ReplacementKitRequestListResponseDto })
  async list(
    @Query('status') status?: ReplacementKitStatus,
  ): Promise<ReplacementKitRequestListResponseDto> {
    const items = await this.replacementKitRequestService.list(status);
    const data = items.map((item) => toReplacementKitRequestResponse(item));

    return successResponse({
      message: 'Replacement kit requests fetched',
      code: HttpStatus.OK,
      data,
      status: 'success',
    });
  }
}
