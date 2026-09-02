import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { AddQuestionResponseService } from './services/add-question-response';
import { GetUserResponseService } from './services/get-response';
import { SetSubmittedService } from './services/set-submitted';
import { addQuestionResponseDto } from './dto/question-resonse.dto';
import { successResponse, SuccessResponseType } from 'src/common/utils';
import { setSubmittedDto } from './dto/set-submitted.dto';
import { SetAgreementDto } from './dto/set-agreement.dto';
import { SetAgreementService } from './services/set-agreement';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health Info')
@Controller('health-info')
export class HealthInfoController {
  constructor(
    private readonly addQuestionResponseService: AddQuestionResponseService,
    private readonly getUserResponseService: GetUserResponseService,
    private readonly setSubmittedService: SetSubmittedService,
    private readonly setAgreementService: SetAgreementService,
  ) {}

  @Get(':kitId')
  async getKitData(@Param('kitId') kitId: string) {
    return this.getUserResponseService.execute(kitId);
  }

  @Post('response')
  @HttpCode(201)
  async addResponse(
    @Body()
    data: addQuestionResponseDto,
  ): Promise<SuccessResponseType> {
    const result = await this.addQuestionResponseService.addResponse(data);
    return successResponse({
      message: 'Response was sent successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'created',
    });
  }

  @Post('submitted')
  @HttpCode(201)
  async setSubmitted(
    @Body()
    data: setSubmittedDto,
  ): Promise<SuccessResponseType> {
    const result = await this.setSubmittedService.setSubmittedStatus(data);
    return successResponse({
      message: `Submitted status set to ${data.submitted} for kitId: ${data.kitId}`,
      code: HttpStatus.OK,
      data: result,
      status: 'created',
    });
  }

  @Post('agreement')
  @HttpCode(201)
  async setAgreement(
    @Body() data: SetAgreementDto,
  ): Promise<SuccessResponseType> {
    await this.setAgreementService.execute(data);

    return successResponse({
      message: `Agreement updated for kitId: ${data.kitId}`,
      code: HttpStatus.OK,
      data: null,
      status: 'created',
    });
  }
}
