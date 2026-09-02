import { Delete, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerProfile } from './entity/customer-profile.entity';
import { GetCustomerProfilesService } from './services/get-customer-profiles.service';
import { CreateCustomerProfileService } from './services/create-customer-profile.service';
import { GetCustomerProfileService } from './services/get-customer-profile.service';
import { GetCustomerProfileByKitIdService } from './services/get-customer-profile-by-kitid.service';
import { CustomerProfilesStatusService } from './services/customer-profiles-status.service';
import { VaariAnalysisGateway } from './gateways/vaari-analysis.gateway';
import { VaariAnalysisCacheService } from 'src/database/cache/vaari-analysis';
import { Kit } from 'src/kit/entity/kit.entity';
import { PractitionerKit } from 'src/kit/entity/practitioner-kits.entity';
import { CheckKitValidityService } from './services/check-kit-validity.service';
import { VerifyTokenMiddleware } from 'src/common/middleware';
import { VaariAnalysisSseBus } from './buses/vaari-analysis-sse.bus';
import { CustomerProfilesController } from './controllers/customer-profiles.controller';
import { VaariAnalysisSseController } from './controllers/vaari-analysis-sse.controller';
import { VaariUsageController } from './controllers/vaari-usage.controller';
import { CreateUsageService } from './services/create-usage.service';
import { GetUsageAnalyticsService } from './services/get-usage-analytics.service';
import { VaariUsageEvent } from './entity/vaari-usage-event.entity';
import { DeleteCustomerProfileService } from './services/delete-customer-profile.service';
import { UsageCache } from './cache/usage.cache';
import { WeeklySummaryService } from './services/get-weekly-summary.service';
import { UsageSeriesService } from './services/usage-series.service';
import { UsageTableService } from './services/usage-table.service';
import { UsageSseBus } from './buses/usage.sse.bus';
import { GetCustomerProfilesAdminService } from './services/admin/get-customer-profiles.admin.service';
import { CreateCustomerProfileAdminService } from './services/admin/create-customer-profile.admin.service';
import { CheckKitValidityAdminService } from './services/admin/check-kit-validity.admin.service';
import { CustomerProfilesAdminController } from './controllers/customer-profiles.admin.controller';
import { CustomerProfilesStatusAdminService } from './services/admin/customer-profiles-status.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerProfile,
      Kit,
      PractitionerKit,
      VaariUsageEvent,
    ]),
  ],
  controllers: [
    CustomerProfilesController,
    VaariAnalysisSseController,
    VaariUsageController,
    CustomerProfilesAdminController,
  ],
  providers: [
    GetCustomerProfilesService,
    CreateCustomerProfileService,
    GetCustomerProfileService,
    GetCustomerProfileByKitIdService,
    CustomerProfilesStatusService,
    GetCustomerProfilesAdminService,
    CreateCustomerProfileAdminService,
    CheckKitValidityAdminService,
    CustomerProfilesStatusAdminService,
    VaariAnalysisGateway,
    VaariAnalysisCacheService,
    CheckKitValidityService,
    VaariAnalysisSseBus,
    CreateUsageService,
    GetUsageAnalyticsService,
    WeeklySummaryService,
    UsageSeriesService,
    UsageTableService,
    DeleteCustomerProfileService,
    UsageCache,
    UsageSseBus,
  ],
  exports: [GetCustomerProfilesService, VaariAnalysisSseBus],
})
export class VaariModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyTokenMiddleware)
      .exclude('vaari/usage/events')
      .forRoutes('vaari/customer-profiles*', 'vaari/usage*');
  }
}
