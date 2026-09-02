import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  HttpStatus,
  Req,
  Param,
  Delete,
  Put,
  Patch,
  Query,
  UseInterceptors,
  UseGuards,
  Headers,
} from '@nestjs/common';
import {
  CustomRequest,
  SuccessResponseType,
  successResponse,
} from 'src/common/utils';
import { CreateKitService } from './service/create-kit';
import { CreateKitDto, KitQueryDto } from './dto/create-kit.dto';
import { GetUserKitService } from './service/get-clients-kits';
import { GetSingleKitService } from './service/get-single-kit';
import { DeleteKitService } from './service/delete-kit';
import { UpdateKitStatusService } from './service/update-kit-status';
import {
  UpdateKitDto,
  UpdateKitStatusDto,
  UpdateDateOfSampleCollectionDto,
  UpdatePractitionerKitNameDto,
} from './dto/update-kit.dto';
import { UpdateKitLockStatusService } from './service/toggle-kit';
import { PageOptionsDto } from 'src/common';
import { GetPractitionerKitService } from './service/get-practitioner-kits';
import { UpdateKitService } from './service/update-kit';
import { SentryInterceptor } from 'src/sentry/sentry.interceptor';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GetFamilyKitService } from './service/get-family-kits';
import { GetOldPractitionerKitService } from './service/get-old-practitioner-kits';
import { GetNameWithKitIDService } from './service/get-name-with-kitId';
import { CompleteReportProcessService } from './service/complete-report-process';
import { CompleteReportDto } from './dto/complete-report.dto';
import { RegisterPractitionerKitService } from './service/register-practitioner-kit';
import { RegisterPractitionerKitDto } from './dto/register-practitioner-kit.dto';
import { UpdatePractitionerKitStatusService } from './service/update-practitioner-kit-status';
import { UpdatePractitionerKitNameService } from './service/update-practitioner-kit-name.service';
import { GetAllKitService } from './service/get-kits';
import { GetAllPractitionerKitService } from './service/get-kits-with-practitioner';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateKitStatusExternalService } from './service/update-kit-status-external';
import { UpdateDateOfSampleCollectionService } from './service/update-date-of-sample-collection';
import { TransferKitService } from './service/transfer-kit';
import { TransferKitDto } from './dto/transfer-kit.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AccountRoles } from 'src/enum';
import { EnqueueHealthInfoDispatchService } from './service/enqueue-health-info-dispatch';

@UseGuards(ThrottlerGuard)
@UseInterceptors(SentryInterceptor)
@ApiTags('Kits')
@Controller('kits')
export class KitController {
  constructor(
    private readonly createKitService: CreateKitService,
    private readonly getUserKitService: GetUserKitService,
    private readonly getSingleKitService: GetSingleKitService,
    private readonly deleteKitService: DeleteKitService,
    private readonly updateKitStatusService: UpdateKitStatusService,
    private readonly updateKitLockStatusService: UpdateKitLockStatusService,
    private readonly getAllKitService: GetAllKitService,
    private readonly getPractitionerKitService: GetPractitionerKitService,
    private readonly updateKitService: UpdateKitService,
    private readonly getFamilyKitService: GetFamilyKitService,
    private readonly getOldPractitionerKitService: GetOldPractitionerKitService,
    private readonly getNameWithKitIDService: GetNameWithKitIDService,
    private readonly completeReportProcessService: CompleteReportProcessService,
    private readonly registerPractitionerKitService: RegisterPractitionerKitService,
    private readonly updatePractitionerKitStatusService: UpdatePractitionerKitStatusService,
    private readonly updatePractitionerKitNameService: UpdatePractitionerKitNameService,
    private readonly getAllPractitionerKitService: GetAllPractitionerKitService,
    private readonly updateKitStatusExternalService: UpdateKitStatusExternalService,
    private readonly updateDateOfSampleCollectionService: UpdateDateOfSampleCollectionService,
    private readonly transferKitService: TransferKitService,
    private readonly enqueueHealthInfoDispatchService: EnqueueHealthInfoDispatchService,
  ) {}

  @Post('')
  @HttpCode(201)
  async createKit(
    @Body() data: CreateKitDto,
    @Req() req: CustomRequest,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    data.userId = req.user.id;
    const result = await this.createKitService.execute(data);
    return successResponse({
      message: 'Kit was registered successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'created',
    });
  }

  @Post('practitioner-kit')
  @HttpCode(201)
  async registerPractitionerKit(
    @Body() data: RegisterPractitionerKitDto,
    @Req() req: CustomRequest,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    data.userId = req.user.id;
    const result = await this.registerPractitionerKitService.execute(data);
    return successResponse({
      message: 'Kit was registered successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'created',
    });
  }

  @Get('user-kits')
  @HttpCode(200)
  async getKit(
    @Req() req: CustomRequest,
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() query: KitQueryDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.getUserKitService.execute(
      req.user.id,
      pageOptionsDto,
      query,
    );
    return successResponse({
      message: 'Kit was fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }
  @Get('')
  @HttpCode(200)
  async getAllKit(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() query: KitQueryDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.getAllKitService.execute(pageOptionsDto, query);
    return successResponse({
      message: 'Kit was fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Put('practitioner-kit-name')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles(AccountRoles.ADMIN)
  async updatePractitionerKitName(
    @Body() data: UpdatePractitionerKitNameDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.updatePractitionerKitNameService.execute(data);
    return successResponse({
      message: 'Practitioner kit name was updated successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Put(':id')
  @HttpCode(200)
  async updateKit(
    @Param('id') id: string,
    @Body() data: UpdateKitDto,
  ): Promise<SuccessResponseType> {
    const result = await this.updateKitService.execute(id, data);
    return successResponse({
      message: 'Kit was updated successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Get('single/:id')
  @HttpCode(200)
  async getSingleKit(
    @Param('id') id: string,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.getSingleKitService.execute(id);
    return successResponse({
      message: 'Kit was fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Get('singlekit/:id')
  @HttpCode(200)
  async getSingleKitById(
    @Param('id') id: string,
  ): Promise<SuccessResponseType> {
    const result = await this.getSingleKitService.execute(id);
    return successResponse({
      message: 'Kit was fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Get('/practitioner-kits')
  @HttpCode(200)
  async getPractitionerKit(
    @Req() req: CustomRequest,
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() query: KitQueryDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.getPractitionerKitService.execute(
      req.user.id,
      pageOptionsDto,
      query,
    );
    return successResponse({
      message: 'Kit was fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }
  @Get('/all-practitioner-kits/:practitionerId')
  @HttpCode(200)
  async getAllPractitionerKit(
    @Param('practitionerId') practitionerId: string,
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() query: KitQueryDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.getAllPractitionerKitService.execute(
      practitionerId,
      pageOptionsDto,
      query,
    );
    return successResponse({
      message: 'Kits with Practitioners was fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Put('status/:kitId')
  @HttpCode(200)
  async updateKitStatus(
    @Param('kitId') kitId: string,
    @Body() data: UpdateKitStatusDto,
  ): Promise<SuccessResponseType> {
    const result = await this.updateKitStatusService.execute(kitId, data);
    return successResponse({
      message: 'Kit status was updated successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Put('/external/status/:kitId')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Update kit status',
    description: `
      Updates the status and related information of a specific kit.
      
      This endpoint allows updating:
      - Kit status (e.g., registered, awaiting-sample, awaiting-result, result-ready, lab-processing, sample-received)
      - Health information completion status (Not important for this endpoint)
      - Submission status (Not important for this endpoint)
      - Related dates based on status changes
      
      **Side Effects:**
      - When status changes to SAMPLE_RECEIVED: Sets dateReceivedByLab
      - When status changes to LAB_PROCESSING: Sets resultsAvailable date
      - When submitted is true: Sets healthInfoCompleted to 'yes'
    `,
  })
  async updateKitStatusExternal(
    @Param('kitId') kitId: string,
    @Body() data: UpdateKitStatusDto,
    @Headers('x-api-key') key: string,
  ): Promise<SuccessResponseType> {
    const result = await this.updateKitStatusExternalService.execute(
      kitId,
      data,
    );
    return successResponse({
      message: 'Kit status was updated successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Put('practitioner-status/:kitId')
  @HttpCode(200)
  async updatePractitionerKitStatus(
    @Param('kitId') kitId: string,
    @Body() data: UpdateKitStatusDto,
  ): Promise<SuccessResponseType> {
    const result = await this.updatePractitionerKitStatusService.execute(
      kitId,
      data,
    );
    return successResponse({
      message: 'Kit status was updated successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Patch('lock-status/:kitId')
  @HttpCode(200)
  async updateKitLockStatus(
    @Param('kitId') kitId: string,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.updateKitLockStatusService.execute(kitId);
    return successResponse({
      message: 'Kit status was updated successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Delete(':id')
  @HttpCode(200)
  async deleteSingleKit(
    @Param('id') id: string,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.deleteKitService.execute(id);
    return successResponse({
      message: 'Kit was deleted successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Get('family-kits')
  @HttpCode(200)
  async getFamilyKits(
    @Req() req: CustomRequest,
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() query: KitQueryDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.getFamilyKitService.execute(
      req.user.id,
      pageOptionsDto,
      query,
    );
    return successResponse({
      message: 'Kit was fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Get('old-practitioner-kits')
  @HttpCode(200)
  async getOldPractitionerKit(
    @Req() req: CustomRequest,
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() query: KitQueryDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.getOldPractitionerKitService.execute(
      req.user.id,
      pageOptionsDto,
      query,
    );
    return successResponse({
      message: 'Kit was fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Get('get-name/:kitId')
  @HttpCode(200)
  async getNameWithKitId(
    @Param('kitId') kitId: string,
  ): Promise<SuccessResponseType> {
    const result = await this.getNameWithKitIDService.execute(kitId);
    return successResponse({
      message: 'Kit was fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Put('complete-process/:kitId')
  @HttpCode(200)
  async completeReportProcess(
    @Param('kitId') kitId: string,
    @Body() data: CompleteReportDto,
  ): Promise<SuccessResponseType> {
    const result = await this.completeReportProcessService.execute(kitId, data);
    return successResponse({
      message: 'Kit process was completed successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Put('update-sample-collection-date/:kitId')
  @HttpCode(200)
  async updateDateOfSampleCollection(
    @Param('kitId') kitId: string,
    @Body() data: UpdateDateOfSampleCollectionDto,
  ): Promise<SuccessResponseType> {
    const result = await this.updateDateOfSampleCollectionService.execute(
      kitId,
      data,
    );
    return successResponse({
      message: 'Date of sample collection was updated successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Post('transfer')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles(AccountRoles.ADMIN)
  @ApiOperation({
    summary: 'Transfer kit from customer to practitioner',
    description:
      'Transfers a kit from a customer to a practitioner. This is an admin-only endpoint.',
  })
  async transferKit(
    @Body() data: TransferKitDto,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.transferKitService.execute(data);
    return successResponse({
      message: 'Kit transferred successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Post('practitioner-kit/:id/health-info-dispatch')
  @HttpCode(200)
  async enqueueHealthInformationDispatch(
    @Param('id') id: string,
    @Headers('x-access-token') token: string,
  ): Promise<SuccessResponseType> {
    const result = await this.enqueueHealthInfoDispatchService.execute(id);
    return successResponse({
      message: 'Health information dispatch enqueued successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }
}
