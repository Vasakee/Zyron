import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  HttpStatus,
  Req,
  Query,
  Param,
  Put,
  UseInterceptors,
  UseGuards,
  Headers,
} from '@nestjs/common';
import {
  CustomRequest,
  SuccessResponseType,
  successResponse,
} from 'src/common/utils';
import { SupportDto, SupportQueryDto } from './dto/support.dto';
import { CreateCaseService } from './services/create-case';
import { GetCaseService } from './services/get-case';
import { PageOptionsDto } from 'src/common';
import { UpdateCaseStatusService } from './services/update-case-status';
import { UpdateSupportDto } from './dto/update-support.dto';
import { AssignCaseStatusService } from './services/assign-case-status ';
import { SentryInterceptor } from 'src/sentry/sentry.interceptor';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GetSingleCaseService } from './services/get-single-case';
import { SupportMessageDto } from './dto/support-message.dto';
import { SendMessageService } from './services/send-message';
import { ApiTags } from '@nestjs/swagger';

@UseGuards(ThrottlerGuard)
@UseInterceptors(SentryInterceptor)
@ApiTags('Support')
@Controller('supports')
export class SupportController {
  constructor(
    private readonly createCaseService: CreateCaseService,
    private readonly getCaseService: GetCaseService,
    private readonly updateCaseService: UpdateCaseStatusService,
    private readonly assignCaseService: AssignCaseStatusService,
    private readonly getSingleCaseService: GetSingleCaseService,
    private readonly sendMessageService: SendMessageService,
  ) {}

  @Post('')
  @HttpCode(201)
  async createCase(
    @Body() data: SupportDto,
    @Req() req: CustomRequest,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    data.userId = req.user.id;
    const result = await this.createCaseService.execute(data);
    return successResponse({
      message: 'Case created successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'created',
    });
  }

  @Get('')
  @HttpCode(200)
  async getCase(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() query: SupportQueryDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.getCaseService.execute(pageOptionsDto, query);
    return successResponse({
      message: 'Cases retrieved successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Get(':id')
  @HttpCode(200)
  async getSingleCase(
    @Param('id') id: string,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.getSingleCaseService.execute(id);
    return successResponse({
      message: 'Case has been retrieved successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Put(':id')
  @HttpCode(200)
  async updateCase(
    @Param('id') id: string,
    @Body() data: UpdateSupportDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.updateCaseService.execute(data, id);
    return successResponse({
      message: 'Support Case has been Updated successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Put('/assign/:id')
  @HttpCode(200)
  async assignCase(
    @Param('id') id: string,
    @Body() data: UpdateSupportDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.assignCaseService.execute(data, id);
    return successResponse({
      message: 'Support Case has been assigned successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Post('messages')
  @HttpCode(201)
  async sendMessage(
    @Body() data: SupportMessageDto,
    @Req() req: CustomRequest,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    data.userId = req.user.id;
    const result = await this.sendMessageService.execute(req.user.id, data);
    return successResponse({
      message: 'Message sent successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'created',
    });
  }
}
