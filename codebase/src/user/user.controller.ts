import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  HttpStatus,
  Req,
  Param,
  Put,
  UseInterceptors,
  UseGuards,
  Headers,
  UploadedFile,
} from '@nestjs/common';

import { GetUserProfileService } from './service/get-user-profile';
import { LoginAccountService } from './service/login-account';
import { CreateCustomerAccountService } from './service/create-customer-account';
import {
  CompleteClientRegistrationDto,
  CreateCustomerAccountDto,
} from './dto/customer-account.dto';
import {
  CustomRequest,
  SuccessResponseType,
  successResponse,
} from 'src/common/utils';
import { LoginAccountDto } from './dto/login-account.dto';
import { ResendValidationTokenService } from './service/resend-validation-token';
import { ValidateAccountService } from './service/validate-account';
import { ResendValidationTokenDto } from './dto/resend-validation-token.dto';
import { ValidateAccountDto } from './dto/validate-account.dto';
import { GetAllUserService } from './service/get-users';
import { GetAUserProfileService } from './service/get-a-user-profile';
import { UpdateCustomerAccountDto } from './dto/update-account.dto';
import { UpdateAccountService } from './service/update-account';
import { CompleteCustomerRegistration } from './service/complete-customer-registration';
import { ForgotPasswordService } from './service/forgot-password';
import { ResetPasswordService } from './service/reset-password';
import { ChangeUserPasswordService } from './service/change-password';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdatePasswordService } from './service/updatePassword';
import { CreatePasswordService } from './service/create-password';
import { SentryInterceptor } from '../sentry/sentry.interceptor';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ResendNewPlatformPasswordResetService } from './service/resend-new-platform-password-reset';
import { ResetNewPlatformPasswordService } from './service/reset-new-platform-password';
import { ResetNewPlatformPasswordDTO } from './dto/reset-new-platform-password.dto';
import { InitiateTransferService } from './service/initiate-transfer';
import { VerifyTransferService } from './service/verify-transfer';
import { CompleteTransferService } from './service/complete-transfer';
import {
  CompleteTransferDTO,
  InitiateTransferDTO,
  VerifyTransferDTO,
} from './dto/transfer.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AccountRoles } from 'src/enum';
import {
  BulkMonthlyBillingAccessDto,
  SetMonthlyBillingAccessDto,
} from './dto/monthly-billing-access.dto';
import { MonthlyBillingAccessService } from './service/monthly-billing-access.service';

@UseGuards(ThrottlerGuard)
@UseInterceptors(SentryInterceptor)
@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private readonly getUserProfileService: GetUserProfileService,
    private readonly loginAccountService: LoginAccountService,
    private readonly createCustomerAccountService: CreateCustomerAccountService,
    private readonly resendValidationTokenService: ResendValidationTokenService,
    private readonly validateAccountService: ValidateAccountService,
    private readonly getAllUserService: GetAllUserService,
    private readonly getAUserProfileService: GetAUserProfileService,
    private readonly updateAccountService: UpdateAccountService,
    private readonly completeCustomerRegistrationService: CompleteCustomerRegistration,
    private readonly updatePasswordService: UpdatePasswordService,
    private readonly forgotPasswordService: ForgotPasswordService,
    private readonly resetPasswordService: ResetPasswordService,
    private readonly changePasswordSvc: ChangeUserPasswordService,
    private readonly createPasswordService: CreatePasswordService,
    private readonly resendNewPlatformPasswordResetService: ResendNewPlatformPasswordResetService,
    private readonly resetNewPlatformPasswordService: ResetNewPlatformPasswordService,
    private readonly initiateTransferService: InitiateTransferService,
    private readonly verifyTransferService: VerifyTransferService,
    private readonly completeTransferService: CompleteTransferService,
    private readonly monthlyBillingAccessService: MonthlyBillingAccessService,
  ) {}

  @Post('')
  @HttpCode(201)
  async signup(
    @Body() data: CreateCustomerAccountDto,
  ): Promise<SuccessResponseType> {
    const result = await this.createCustomerAccountService.execute(data);
    return successResponse({
      message: 'Account was created successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'created',
    });
  }

  @Post('complete-registration')
  @HttpCode(200)
  async completeRegistration(
    @Body() data: CompleteClientRegistrationDto,
  ): Promise<SuccessResponseType> {
    const result = await this.completeCustomerRegistrationService.execute(data);
    return successResponse({
      message: 'Registration was completed successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Get('')
  @HttpCode(200)
  async getAllProfile(): Promise<SuccessResponseType> {
    const result = await this.getAllUserService.execute();
    return successResponse({
      message: 'All Users fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Get('/profile')
  @HttpCode(200)
  async getProfile(@Req() req: CustomRequest): Promise<SuccessResponseType> {
    const result = await this.getUserProfileService.execute(req.user.id);
    return successResponse({
      message: 'User profile fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Get(':id')
  @HttpCode(200)
  async getAUserProfile(@Param('id') id: string): Promise<SuccessResponseType> {
    const result = await this.getAUserProfileService.execute(id);
    return successResponse({
      message: 'User profile fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(
    @Body() data: ForgotPasswordDTO,
  ): Promise<SuccessResponseType> {
    await this.forgotPasswordService.execute(data);
    return successResponse({
      message: `An email has been sent to ${data.email} with instructions on how to reset password.`,
      code: HttpStatus.OK,

      status: 'success',
    });
  }

  @Post('reset-password/:token')
  @HttpCode(200)
  async resetPassword(
    @Body() data: ResetPasswordDTO,
    @Param('token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.resetPasswordService.execute(data, token);
    return successResponse({
      message: 'Reset password successfully',
      code: HttpStatus.OK,
      status: 'success',
    });
  }

  @Post('create-password/:token')
  @HttpCode(200)
  async createPassword(
    @Body() data: ResetPasswordDTO,
    @Param('token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.createPasswordService.execute(data, token);
    return successResponse({
      message: 'Password creation successfully',
      code: HttpStatus.OK,
      status: 'success',
      data: result,
    });
  }

  @Put('/change-password')
  @HttpCode(200)
  async changePassword(
    @Req() req: CustomRequest,
    @Body() body: ChangePasswordDto,
  ): Promise<SuccessResponseType> {
    body.userId = req.user.id;
    await this.changePasswordSvc.execute(body);
    return successResponse({
      message: 'Password changed successfully',
      code: HttpStatus.OK,
    });
  }

  @Post('/login')
  @HttpCode(200)
  async login(@Body() data: LoginAccountDto): Promise<SuccessResponseType> {
    const result = await this.loginAccountService.execute(data);
    return successResponse({
      message: 'Login was successful',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Post('/resend-token')
  @HttpCode(200)
  async resendToken(
    @Body() data: ResendValidationTokenDto,
  ): Promise<SuccessResponseType> {
    const result = await this.resendValidationTokenService.execute(data);
    return successResponse({
      message: 'Token resend successful',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Post('/validate-account')
  @HttpCode(200)
  async validateAccount(
    @Body() data: ValidateAccountDto,
  ): Promise<SuccessResponseType> {
    const result = await this.validateAccountService.execute(data);
    return successResponse({
      message: 'Account validation was successful',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }
  @Put('')
  @HttpCode(200)
  async updateAccount(
    @Req() req: CustomRequest,
    @Body() data: UpdateCustomerAccountDto,
  ): Promise<SuccessResponseType> {
    const result = await this.updateAccountService.execute(req.user.id, data);
    return successResponse({
      message: 'Account update was successful',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Put('password')
  @HttpCode(200)
  async updatePassword(
    @Req() req: CustomRequest,
    @Body() data: UpdatePasswordDto,
  ): Promise<SuccessResponseType> {
    const result = await this.updatePasswordService.execute(req.user.id, data);
    return successResponse({
      message: 'Account update was successful',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Post('resend-new-platform-password')
  @HttpCode(200)
  async newPlatformPasswordResend(
    @Body() data: ForgotPasswordDTO,
  ): Promise<SuccessResponseType> {
    await this.resendNewPlatformPasswordResetService.execute(data);
    return successResponse({
      message: `An email has been sent to ${data.email} with instructions on how to reset password.`,
      code: HttpStatus.OK,

      status: 'success',
    });
  }

  @Post('reset-new-platform-password/:token')
  @HttpCode(200)
  async newPlatformPasswordReset(
    @Body() data: ResetNewPlatformPasswordDTO,
    @Param('token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.resetNewPlatformPasswordService.execute(
      data,
      token,
    );
    return successResponse({
      message: 'Reset password successfully',
      code: HttpStatus.OK,
      status: 'success',
    });
  }

  @Post('initiate-transfer')
  @HttpCode(200)
  async initiateTransfer(
    @Req() req: CustomRequest,
    @Body() data: InitiateTransferDTO,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    data.userId = req.user.id;
    const result = await this.initiateTransferService.execute(data);
    return successResponse({
      message: 'Transfer Initiated Successfully',
      code: HttpStatus.OK,
      status: 'success',
      data: result,
    });
  }

  @Post('verify-transfer')
  @HttpCode(200)
  async verifyTransfer(
    @Body() data: VerifyTransferDTO,
  ): Promise<SuccessResponseType> {
    const result = await this.verifyTransferService.execute(data);
    return successResponse({
      message: 'Transfer verified Successfully',
      code: HttpStatus.OK,
      status: 'success',
      data: result,
    });
  }

  @Post('complete-transfer')
  @HttpCode(200)
  async completeTransfer(
    @Body() data: CompleteTransferDTO,
  ): Promise<SuccessResponseType> {
    const result = await this.completeTransferService.execute(data);
    return successResponse({
      message: 'Transfer completed Successfully',
      code: HttpStatus.OK,
      status: 'success',
      data: result,
    });
  }

  @Post('monthly-billing-access')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles(AccountRoles.ADMIN)
  @ApiBearerAuth()
  async setMonthlyBillingAccess(
    @Body() data: SetMonthlyBillingAccessDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.monthlyBillingAccessService.setAccessByEmail(
      data.email,
      data.enable,
    );
    return successResponse({
      message: `Monthly billing access ${
        data.enable ? 'enabled' : 'disabled'
      } for ${data.email}`,
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Post('monthly-billing-access/bulk')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles(AccountRoles.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  async bulkSetMonthlyBillingAccess(
    @Body() data: BulkMonthlyBillingAccessDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: CustomRequest,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.monthlyBillingAccessService.enqueueBulkAccess(
      file,
      data.enable ?? true,
      req.user?.id,
    );
    return successResponse({
      message: `Monthly billing access update queued for ${result.queued} users`,
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }
}
