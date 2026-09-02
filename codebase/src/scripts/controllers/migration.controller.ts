import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { MigrateUsersService } from '../services/migrate-users';
import { MigrateClientPractitionersService } from '../services/migrate-client-practitioners';
import { SuccessResponseType, successResponse } from 'src/common/utils';
import { GetReportFilesService } from '../services/get-report-files';
import { MigrateKitService } from '../services/migrate-kits';
import { MigrateFamilyKitService } from '../services/migrate-family-kits';
import { MigratePractitionerKitService } from '../services/migrate-practitioner-kits';
import { ReportDto } from '../dto/report-files.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Migration')
@Controller('script/migrate')
export class MigrationController {
  constructor(
    private readonly migrateUsersService: MigrateUsersService,
    private readonly migrateClientPractitionersService: MigrateClientPractitionersService,
    private readonly getReportFilesService: GetReportFilesService,
    private readonly migrateKitService: MigrateKitService,
    private readonly migrateFamilyKitService: MigrateFamilyKitService,
    private readonly migratePractitionerKitService: MigratePractitionerKitService,
  ) {}

  @Post('/users')
  @HttpCode(201)
  async migrateUsers(): Promise<SuccessResponseType> {
    await this.migrateUsersService.execute();
    return successResponse({
      message: 'Migration complete',
      code: HttpStatus.OK,
      status: 'created',
    });
  }

  @Post('/client-practitioners')
  @HttpCode(201)
  async migrateClientPractitioners(): Promise<SuccessResponseType> {
   const result = await this.migrateClientPractitionersService.execute();
    return successResponse({
      message: 'Migration complete',
      code: HttpStatus.OK,
      status: 'created',
      data: result
    });
  }

  @Post('/kits-files')
  @HttpCode(201)
  async viewKits(
    @Body() data:ReportDto,
  ): Promise<SuccessResponseType> {
    const result = await this.getReportFilesService.execute(data.kitId);
    return successResponse({
      message: 'Migration complete',
      code: HttpStatus.OK,
      status: 'created',
      data: result,
    });
  }

  @Post('/kits')
  @HttpCode(201)
  async migrateKits(): Promise<SuccessResponseType> {
    await this.migrateKitService.execute();
    return successResponse({
      message: 'Migration complete',
      code: HttpStatus.OK,
      status: 'created',
    });
  }

  @Post('/family-kits')
  @HttpCode(201)
  async migrateFamilyKits(): Promise<SuccessResponseType> {
    await this.migrateFamilyKitService.execute();
    return successResponse({
      message: 'Migration complete',
      code: HttpStatus.OK,
      status: 'created',
    });
  }

  @Post('/practitioner-kits')
  @HttpCode(201)
  async migratePractitionerKits(): Promise<SuccessResponseType> {
    await this.migratePractitionerKitService.execute();
    return successResponse({
      message: 'Migration complete',
      code: HttpStatus.OK,
      status: 'created',
    });
  }
}