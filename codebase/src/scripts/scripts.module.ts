import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientPractitioner } from 'src/practitioner/entity/client-practitioner.entity';
import { Practitioner } from 'src/practitioner/entity/practitioner.entity';
import { User } from 'src/user/entity/user.entity';
import { MigrationController } from './controllers/migration.controller';
import { MigrateUsersService } from './services/migrate-users';
import { MigrateClientPractitionersService } from './services/migrate-client-practitioners';
import { GetReportFilesService } from './services/get-report-files';
import { S3BucketService } from 'src/aws/services/s3-bucket.service';
import { MigrateKitService } from './services/migrate-kits';
import { MigrateFamilyKitService } from './services/migrate-family-kits';
import { MigratePractitionerKitService } from './services/migrate-practitioner-kits';
import { Kit } from 'src/kit/entity/kit.entity';
import { FamilyKit } from 'src/kit/entity/family-kit.entity';
import { PractitionerKit } from 'src/kit/entity/practitioner-kits.entity';
import { KitTransferService } from './services/kit-transfer';
import { KitScriptsController } from './controllers/kit.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Practitioner,
      ClientPractitioner,
      Kit,
      FamilyKit,
      PractitionerKit,  
    ]),
  ],
  controllers: [MigrationController, KitScriptsController],
  providers: [
    MigrateUsersService,
    MigrateClientPractitionersService,
    GetReportFilesService,
    S3BucketService,
    MigrateKitService,
    MigrateFamilyKitService,
    MigratePractitionerKitService,
    KitTransferService, 
  ],
})
export class ScriptsModule {}
