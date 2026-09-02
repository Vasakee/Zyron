import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthExternalService } from './auth-external.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { successResponse, SuccessResponseType } from 'src/common/utils';
import {
  LoginExternalAccountDto,
  LoginExternalResponseDto,
} from './dto/login-external-account.dto';

@Controller('/external/auth')
export class AuthExternalController {
  constructor(private readonly authService: AuthExternalService) {}
  @ApiTags('Authentication')
  @ApiOperation({ summary: 'Authenticate' })
  @ApiOkResponse({
    description: 'Authentication successful',
    type: LoginExternalResponseDto,
    status: 200,
  })
  @Post()
  @HttpCode(200)
  async authenticate(
    @Body() data: LoginExternalAccountDto,
  ): Promise<SuccessResponseType> {
    const result = await this.authService.loginAccountService(data);
    return successResponse({
      message: 'Authentication successful',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }
}
