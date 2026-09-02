import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  HttpStatus,
  Put,
  Req,
  UseInterceptors,
  UseGuards,
  Query,
  Headers,
  Param,
} from '@nestjs/common';

import {
  CustomRequest,
  SuccessResponseType,
  successResponse,
} from 'src/common/utils';

import {
  AdminQueryDto,
  CreateAdminDto,
  PromoteUserToAdminDto,
  UpdateAdminAccountDto,
  UpdateAdminDto,
} from './dto/admin.dto';
import { CreateAdminAccountService } from './service/create-admin';
import { GetAdminsService } from './service/get-admins';
import { UpdateAccountService } from './service/update-account';
import { SentryInterceptor } from 'src/sentry/sentry.interceptor';
import { ThrottlerGuard } from '@nestjs/throttler';
import { PageOptionsDto } from 'src/common';
import { UpdateAdminAccountService } from './service/update-admin-account';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AccountRoles } from 'src/enum';
import { PromoteUserToAdminService } from './service/promote-user-to-admin';

@UseGuards(ThrottlerGuard)
@UseInterceptors(SentryInterceptor)
@ApiTags('Admin')
@Controller('admins')
export class AdminController {
  constructor(
    private readonly createAdminAccountService: CreateAdminAccountService,
    private readonly getAdminsService: GetAdminsService,
    private readonly updateAccountService: UpdateAccountService,
    private readonly updateAdminAccountService: UpdateAdminAccountService,
    private readonly promoteUserToAdminService: PromoteUserToAdminService,
  ) {}

  @Post('')
  @HttpCode(201)
  async createAdmin(
    @Body() data: CreateAdminDto,
  ): Promise<SuccessResponseType> {
    const result = await this.createAdminAccountService.execute(data);
    return successResponse({
      message: 'Admin Account was created successfully',
      code: HttpStatus.CREATED,
      data: result,
      status: 'created',
    });
  }

  @Get('')
  @HttpCode(200)
  async getAdmins(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() query: AdminQueryDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.getAdminsService.execute(pageOptionsDto, query);
    return successResponse({
      message: 'Admins were fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Put('')
  @HttpCode(200)
  async updateAccount(
    @Req() req: CustomRequest,
    @Body() data: UpdateAdminAccountDto,
  ): Promise<SuccessResponseType> {
    const result = await this.updateAccountService.execute(req.user.id, data);
    return successResponse({
      message: 'Account update was successful',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Put(':adminId')
  @HttpCode(200)
  async updateAdmin(
    @Param('adminId') adminId: string,
    @Body() data: UpdateAdminDto,
  ): Promise<SuccessResponseType> {
    const result = await this.updateAdminAccountService.execute(adminId, data);
    return successResponse({
      message: 'Admin account update was successful',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Post('promote')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles(AccountRoles.SUPER_ADMIN)
  @ApiBearerAuth()
  async promoteUserToAdmin(
    @Body() data: PromoteUserToAdminDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.promoteUserToAdminService.execute(data);
    return successResponse({
      message: 'User promoted to admin successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }
}
