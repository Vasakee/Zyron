import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  Patch,
} from '@nestjs/common';
import { PageOptionsDto } from 'src/common';
import {
  CreateCustomerProfileDto,
  UpdateCustomerProfileStatusDto,
} from '../dto/create-customer-profile.dto';
import { GetCustomerProfilesAdminService } from '../services/admin/get-customer-profiles.admin.service';
import { CustomRequest } from 'src/common/utils';
import { CreateCustomerProfileAdminService } from '../services/admin/create-customer-profile.admin.service';
import { CheckKitValidityAdminService } from '../services/admin/check-kit-validity.admin.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerProfilesStatusAdminService } from '../services/admin/customer-profiles-status.service';

@ApiTags('Customer Profiles Admin')
@Controller('vaari/customer-profiles/admin')
export class CustomerProfilesAdminController {
  constructor(
    private readonly getCustomerProfilesAdminService: GetCustomerProfilesAdminService,
    private readonly createService: CreateCustomerProfileAdminService,
    private readonly checkKitValidityService: CheckKitValidityAdminService,
    private readonly statusService: CustomerProfilesStatusAdminService,
  ) {}

  @Post()
  create(@Body() dto: CreateCustomerProfileDto, @Req() req: CustomRequest) {
    dto.userId = req.user.id;
    return this.createService.execute(dto);
  }

  @Get('check-kit-validity/:kitId')
  checkKitValidity(@Param('kitId') kitId: string, @Req() req: CustomRequest) {
    const userId = req.user.id;
    return this.checkKitValidityService.execute(kitId, userId);
  }

  @Get('all')
  findAllAdmin(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query('search') search?: string,
  ) {
    return this.getCustomerProfilesAdminService.execute(pageOptionsDto, search);
  }

  @Patch(':kitId/status')
  @ApiOperation({ summary: 'Update customer profile status by kitId' })
  updateStatus(
    @Param('kitId') kitId: string,
    @Body() dto: UpdateCustomerProfileStatusDto,
    @Req() req: CustomRequest,
  ) {
    dto.userId = req.user.id;
    return this.statusService.updateStatus(kitId, dto);
  }
}
