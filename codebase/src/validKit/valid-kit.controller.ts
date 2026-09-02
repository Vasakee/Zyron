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
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  CustomRequest,
  SuccessResponseType,
  successResponse,
} from 'src/common/utils';

import { FileInterceptor } from '@nestjs/platform-express';
import { CreateValidKitService } from './service/bulk-insert-valid-kit.ts';
import { PageOptionsDto } from '../common/index.js';
import { GetAllValidKitService } from './service/get-valid-kit.js';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Valid Kits')
@Controller('validKits')
export class ValidKitController {
  constructor(
    private readonly bulkInsertKitService: CreateValidKitService,
    private readonly getAllValidKitService: GetAllValidKitService,
  ) {}

  @Post('bulk')
  @UseInterceptors(FileInterceptor('csvFile', {}))
  async createBulkPractitionerAccount(
    @UploadedFile() csvFile: Express.Multer.File,
  ): Promise<SuccessResponseType> {
    const result = await this.bulkInsertKitService.execute(csvFile);
    return successResponse({
      message: 'ALL Valid kits were uploaded successfully',
      code: HttpStatus.OK,
      data: result,
    });
  }

  @Get('')
  @HttpCode(200)
  async getAllValidKit(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<SuccessResponseType> {
    const result = await this.getAllValidKitService.execute(pageOptionsDto);
    return successResponse({
      message: 'Valid Kits was fetched successfully',
      code: HttpStatus.OK,
      data: result,
      status: 'success',
    });
  }
}
