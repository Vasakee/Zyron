import { CreateFeedbackService } from './service/create-feedback';
import { CreateFeedbackDto } from './dto/feedback.dto';
import {
  UseGuards,
  UseInterceptors,
  Controller,
  Post,
  HttpCode,
  Body,
  HttpStatus,
  Get,
  Query,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { PageOptionsDto } from 'src/common';
import { SuccessResponseType, successResponse } from 'src/common/utils';
import { FeedBackQueryDto } from '../feedback/dto/feedback.dto';
import { SentryInterceptor } from 'src/sentry/sentry.interceptor';
import { GetAllFeedbackService } from './service/get-feedback';
import { ApiTags } from '@nestjs/swagger';

@UseGuards(ThrottlerGuard)
@UseInterceptors(SentryInterceptor)
@ApiTags('Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(
    private readonly createFeedbackService: CreateFeedbackService,
    private readonly getAllFeedbackService: GetAllFeedbackService,
  ) {}

  @Post('')
  @HttpCode(201)
  async createFeedback(
    @Body() data: CreateFeedbackDto,
  ): Promise<SuccessResponseType> {
    const result = await this.createFeedbackService.execute(data);
    return successResponse({
      message: 'Feedback was sent successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'created',
    });
  }

  @Get('')
  @HttpCode(200)
  async getAllFeedback(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() query: FeedBackQueryDto,
  ): Promise<SuccessResponseType> {
    const result = await this.getAllFeedbackService.execute(
      pageOptionsDto,
      query,
    );
    return successResponse({
      message: 'Feedbacks  were fetched successfully',

      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }
}
