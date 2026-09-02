import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  HttpStatus,
  Req,
  Put,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { CreatePractitionerAccountService } from './service/create-practitioner-account';
import {
  CreatePractitionerAccountDto,
  PractitionerPageOptionsDto,
  PractitionerQueryDto,
} from './dto/create-practitioner-dto';
import {
  CustomRequest,
  SuccessResponseType,
  successResponse,
} from 'src/common/utils';
import { GetAllPractitionerProfileService } from './service/get-practitioners';
import { UpdatePractitionerAccountDto } from './dto/update-practitioner.dto';
import { UpdatePractitionerAccountService } from './service/update-practitioner-account';
import { CreateClientService } from './service/create-client';
import { CreateClienttDto } from './dto/create-client.dto';
import { UpdatePractitionerStatusService } from './service/update-practitioner-account-status';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateBulkPractitionerAccountService } from './service/create_bulk_practitioner';
import { UpdatePractitionerAccountStatusDto } from './dto/update-practitioner-status.dto';
import { UpdatePractitionerAccountIdService } from './service/update-practitioner-account-with-id';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SentryInterceptor } from 'src/sentry/sentry.interceptor';
import { ThrottlerGuard } from '@nestjs/throttler';
import { SendHealthInfoService } from './service/send-health-info';
import { SendInfoDto } from './dto/send-health.info.dto';
import { ApiTags } from '@nestjs/swagger';

@UseGuards(ThrottlerGuard)
@UseInterceptors(SentryInterceptor)
@ApiTags('Practitioners')
@Controller('practitioners')
export class PractitionerController {
  constructor(
    private readonly getAllPractitionerProfileService: GetAllPractitionerProfileService,
    private readonly createPractitionerAccountService: CreatePractitionerAccountService,
    private readonly updatePractitionerAccountService: UpdatePractitionerAccountService,
    private readonly createClientService: CreateClientService,
    private readonly updatePractitionerStatusService: UpdatePractitionerStatusService,
    private readonly createBulkPractitionerAccountService: CreateBulkPractitionerAccountService,
    private readonly updatePractitionerAccountIdService: UpdatePractitionerAccountIdService,
    private readonly sendHealthInfo: SendHealthInfoService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post('')
  @HttpCode(201)
  async signup(
    @Body() data: CreatePractitionerAccountDto,
  ): Promise<SuccessResponseType> {
    const result = await this.createPractitionerAccountService.execute(data);
    return successResponse({
      message: 'Account was created successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'created',
    });
  }

  @Post('create-client')
  @HttpCode(201)
  async clientCreation(
    @Body() data: CreateClienttDto,
  ): Promise<SuccessResponseType> {
    const result = await this.createClientService.execute(data);
    return successResponse({
      message: 'Account was created successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'created',
    });
  }

  @Post('send-info')
  @HttpCode(201)
  async sendInfo(@Body() data: SendInfoDto): Promise<SuccessResponseType> {
    const result = await this.sendHealthInfo.execute(data);
    return successResponse({
      message: 'Email was sent successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'created',
    });
  }

  @Get('')
  @HttpCode(200)
  async getAllProfile(
    @Query() pageOptionsDto: PractitionerPageOptionsDto,
    @Query() query: PractitionerQueryDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.getAllPractitionerProfileService.execute(
      pageOptionsDto,
      query,
    );
    return successResponse({
      message: 'All practitioners fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Put('status/:id')
  @HttpCode(200)
  async updatePractitionerStatusAccount(
    @Param('id') id: string,
    @Headers('x-access-token') token: string,
    @Body() data: UpdatePractitionerAccountStatusDto,
  ): Promise<SuccessResponseType> {
    const result = await this.updatePractitionerStatusService.execute(id, data);
    return successResponse({
      message: 'Status update was successful',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Put()
  @HttpCode(200)
  async updatePractitionerAccount(
    @Req() req: CustomRequest,
    @Body() data: UpdatePractitionerAccountDto,
  ): Promise<SuccessResponseType> {
    const result = await this.updatePractitionerAccountService.execute(
      req.user.id,
      data,
    );
    return successResponse({
      message: 'Account update was successful',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Put('/:id')
  @HttpCode(200)
  async updatePractitionerAccountWithId(
    @Param('id') id: string,
    @Body() data: UpdatePractitionerAccountDto,
  ): Promise<SuccessResponseType> {
    const result = await this.updatePractitionerAccountIdService.execute(
      id,
      data,
    );
    return successResponse({
      message: 'Account update was successful',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Post('bulk')
  @UseInterceptors(FileInterceptor('csvFile', {}))
  async createBulkPractitionerAccount(
    @UploadedFile() csvFile: Express.Multer.File,
  ): Promise<SuccessResponseType> {
    const result = await this.createBulkPractitionerAccountService.execute(
      csvFile,
    );
    return successResponse({
      message: 'Practitioner Accounts were created successfully',
      code: HttpStatus.OK,
      data: result,
    });
  }

  @Post('resend-invites')
  async resendInvites(
    @Body() data: { email: string },
  ): Promise<SuccessResponseType> {
    this.eventEmitter.emit('invite.practitioner', {
      email: data.email,
    });
    return successResponse({
      message: '',
      code: HttpStatus.OK,
      data: 'result',
    });
  }
}
