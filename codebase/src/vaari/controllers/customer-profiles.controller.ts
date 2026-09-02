import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Req,
  Delete,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PageOptionsDto } from 'src/common';
import { CreateCustomerProfileService } from '../services/create-customer-profile.service';
import { GetCustomerProfilesService } from '../services/get-customer-profiles.service';
import { GetCustomerProfileService } from '../services/get-customer-profile.service';
import { GetCustomerProfileByKitIdService } from '../services/get-customer-profile-by-kitid.service';
import {
  CreateCustomerProfileDto,
  UpdateCustomerProfileStatusDto,
} from '../dto/create-customer-profile.dto';
import { CustomerProfilesStatusService } from '../services/customer-profiles-status.service';
import { CheckKitValidityService } from '../services/check-kit-validity.service';
import { CustomRequest } from 'src/common/utils';
import { DeleteCustomerProfileService } from '../services/delete-customer-profile.service';

@ApiTags('Customer Profiles')
@Controller('vaari/customer-profiles')
export class CustomerProfilesController {
  constructor(
    private readonly createService: CreateCustomerProfileService,
    private readonly getAllService: GetCustomerProfilesService,
    private readonly getOneService: GetCustomerProfileService,
    private readonly getByKitIdService: GetCustomerProfileByKitIdService,
    private readonly statusService: CustomerProfilesStatusService,
    private readonly checkKitValidityService: CheckKitValidityService,
    private readonly deleteService: DeleteCustomerProfileService,
  ) {}

  @Post()
  create(@Body() dto: CreateCustomerProfileDto, @Req() req: CustomRequest) {
    dto.userId = req.user.id;
    return this.createService.execute(dto);
  }

  @Get()
  findAll(
    @Query() pageOptionsDto: PageOptionsDto,
    @Req() req: CustomRequest,
    @Query('search') search?: string,
  ) {
    return this.getAllService.execute(req.user.id, pageOptionsDto, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: CustomRequest) {
    return this.getOneService.execute(id);
  }

  @Get('kit/:kitId')
  findByKitId(@Param('kitId') kitId: string, @Req() req: CustomRequest) {
    return this.getByKitIdService.execute(kitId, req.user.id);
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

  @Get('check-kit-validity/:kitId')
  checkKitValidity(@Param('kitId') kitId: string, @Req() req: CustomRequest) {
    const userId = req.user.id;
    return this.checkKitValidityService.execute(kitId, userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.deleteService.execute(id);
  }
}
