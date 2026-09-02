import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  HttpStatus,
  Param,
  Delete,
  Put,
  Query,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import {
  CustomRequest,
  SuccessResponseType,
  successResponse,
} from 'src/common/utils';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadTutorialService } from './service/upload-tutorial';
import {
  TutorialsQueryDto,
  UploadTutorialDto,
} from './dto/upload-tutorial.dto';
import { GetSingleTutorialsService } from './service/get-single-tutorial';
import { DeleteTutorialsService } from './service/delete-tutorial';
import { UpdateTutorialStatusService } from './service/update-tutorial';
import { UpdateTutorialDto } from './dto/update-tutorial.dto';
import { GetAllTutorialService } from './service/get-tutorials';
import { PageOptionsDto } from 'src/common';
import { SentryInterceptor } from 'src/sentry/sentry.interceptor';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';

@UseGuards(ThrottlerGuard)
@UseInterceptors(SentryInterceptor)
@ApiTags('Tutorials')
@Controller('tutorials')
export class TutorialsController {
  constructor(
    private readonly uploadTutorialService: UploadTutorialService,
    private readonly getSingleTutorialService: GetSingleTutorialsService,
    private readonly deleteTutorialService: DeleteTutorialsService,
    private readonly updateTutorialStatusService: UpdateTutorialStatusService,
    private readonly getAllTutorialService: GetAllTutorialService,
  ) {}

  @Post('')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file', {}))
  async uploadTutorial(
    @Body() data: UploadTutorialDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<SuccessResponseType> {
    const result = await this.uploadTutorialService.execute(data, file);
    return successResponse({
      message: 'Tutorial was uploaded successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'created',
    });
  }

  @Get('')
  @HttpCode(200)
  async getAllTutorials(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() query: TutorialsQueryDto,
  ): Promise<SuccessResponseType> {
    const result = await this.getAllTutorialService.execute(
      pageOptionsDto,
      query,
    );
    return successResponse({
      message: 'Resources  was fetched successfully',

      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Get(':id')
  @HttpCode(200)
  async getSingleTutorial(
    @Param('id') id: string,
  ): Promise<SuccessResponseType> {
    const result = await this.getSingleTutorialService.execute(id);
    return successResponse({
      message: 'Tutorial was fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Post(':id')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file', {}))
  async updateTutorialStatus(
    @Param('id') id: string,
    @Body() data: UpdateTutorialDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<SuccessResponseType> {
    const result = await this.updateTutorialStatusService.execute(
      id,
      data,
      file,
    );

    return successResponse({
      message: 'Tutorial status was updated successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }

  @Delete(':id')
  @HttpCode(200)
  async deleteSingleTutorial(
    @Param('id') id: string,
  ): Promise<SuccessResponseType> {
    const result = await this.deleteTutorialService.execute(id);
    return successResponse({
      message: 'Tutorial was deleted successfully',

      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }
}