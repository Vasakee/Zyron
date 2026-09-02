import { Body, Controller, Get, Post, Query, Req, Sse } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomRequest } from 'src/common/utils';
import { map } from 'rxjs';
import { WeeklySummaryService } from '../services/get-weekly-summary.service';
import { UsageSeriesService } from '../services/usage-series.service';
import { UsageTableService } from '../services/usage-table.service';
import { CreateUsageService } from '../services/create-usage.service';
import { UsageSseBus } from '../buses/usage.sse.bus';
import { UsageTableQueryDto } from '../dto/usage-table-query.dto';
import { UsageSeriesDto } from '../dto/usage-series.dto';
import { CreateUsageDto } from '../dto/create-usage.dto';

@ApiTags('Usage')
@Controller('vaari/usage')
export class VaariUsageController {
  constructor(
    private readonly weeklyService: WeeklySummaryService,
    private readonly seriesService: UsageSeriesService,
    private readonly tableService: UsageTableService,
    private readonly createService: CreateUsageService,
    private readonly sse: UsageSseBus,
  ) {}

  @Get('weekly')
  @ApiOperation({ summary: 'Get weekly usage summary for current user' })
  weekly(@Req() req: CustomRequest) {
    return this.weeklyService.execute(req.user.id);
  }

  @Get('analytics/series')
  @ApiOperation({ summary: 'Get usage series for charts' })
  series(@Query() dto: UsageSeriesDto) {
    return this.seriesService.execute(dto);
  }

  @Get('analytics/table')
  @ApiOperation({ summary: 'Get paginated usage table for admin' })
  table(@Query() dto: UsageTableQueryDto, @Req() req: CustomRequest) {
    return this.tableService.execute(dto);
  }

  @Post()
  @ApiOperation({ summary: 'Create a usage record and invalidate caches' })
  create(@Body() dto: CreateUsageDto, @Req() req: CustomRequest) {
    return this.createService.execute(req.user.id, dto);
  }

  @Sse('events')
  events() {
    return this.sse.stream().pipe(map((d) => ({ data: d })));
  }
}
