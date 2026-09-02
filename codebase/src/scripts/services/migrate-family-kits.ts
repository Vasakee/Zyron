import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { GetReportFilesService } from './get-report-files';
import { User } from 'src/user/entity/user.entity';
import { KitStatus, LockStatus } from 'src/enum';
import { FamilyKit } from 'src/kit/entity/family-kit.entity';
import { GetFamilyKits } from '../api/requests/get-family-kits';

interface FamilyKitInterface {
  name: string | null;
  kitId: string;
  identifier: string | null;
  status: string | null;
  collected?: Date | null;
  received: Date | null;
  expected: Date | null;
  available: Date | null;
  relationEmail?: string;
  relationName?: string;
}

@Injectable()
export class MigrateFamilyKitService {
  private readonly logger = new Logger(MigrateFamilyKitService.name);

  constructor(
    @InjectRepository(FamilyKit)
    private readonly familyKitRepo: Repository<FamilyKit>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly getReportFilesService: GetReportFilesService,
  ) {}

  async execute() {
    try {
      const [familyKits, users] = await Promise.all([
        GetFamilyKits() as Promise<FamilyKitInterface[]>,
        this.userRepo.find(),
      ]);

      const userMap = new Map(users.map(user => [user.email, user]));

      const kitIds = familyKits.map(kit => kit.kitId);
      const existingFamilyKits = await this.familyKitRepo.find({
        where: { kitNumber: In(kitIds) },
      });
      const existingKitMap = new Map(existingFamilyKits.map(kit => [kit.kitNumber, kit]));

      const migratePromises = familyKits.map(async familyKit => {
        const user = userMap.get(familyKit.relationEmail);
        const { pdfUrl, csvUrl, fastQUrl } = await this.getReportFilesService.execute(familyKit.kitId);

        if (!user) {
          console.log(familyKit);
          return;
        }

        const existingKit = existingKitMap.get(familyKit.kitId);
        const kitStatus = this.getKitStatus(familyKit.status);

        if (existingKit) {
          existingKit.userId = user.id;
          existingKit.name = familyKit.name;
          existingKit.status = kitStatus;
          existingKit.dateOfSampleCollection = familyKit.collected;
          existingKit.dateReceivedByLab = familyKit.received;
          existingKit.resultsAvailable = familyKit.available;
          existingKit.lockStatus = LockStatus.UNLOCKED;
          existingKit.pdfUrl = pdfUrl;
          existingKit.summaryUrl = csvUrl;
          existingKit.fastQUrl = fastQUrl;

          await this.familyKitRepo.save(existingKit);
        } else {
          const newKit = this.familyKitRepo.create({
            userId: user.id,
            name: familyKit.name,
            status: kitStatus,
            dateOfSampleCollection: familyKit.collected,
            dateReceivedByLab: familyKit.received,
            resultsAvailable: familyKit.available,
            lockStatus: LockStatus.UNLOCKED,
            pdfUrl,
            summaryUrl: csvUrl,
            fastQUrl,
            kitNumber: familyKit.kitId,
          });

          await this.familyKitRepo.save(newKit);
        }
      });

      await Promise.all(migratePromises);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  private getKitStatus(status: string): KitStatus {
    const statusMappings: { [key: string]: KitStatus } = {
      'results-processed': KitStatus.RESULT_READY,
      'lab-processing': KitStatus.AWAITNG_RESULT,
      'lab-processing-repeating': KitStatus.AWAITNG_RESULT,
      'sample-received': KitStatus.AWAITNG_RESULT,
      'sample-not-viable': KitStatus.AWAITNG_RESULT,
      'enquiry-initiated': KitStatus.AWAITNG_SAMPLE,
      'follow-up-email-sent': KitStatus.AWAITNG_SAMPLE,
      registered: KitStatus.AWAITNG_SAMPLE,
    };

    const slugifiedStatus = this.slugify(status);
    return statusMappings[slugifiedStatus] || null;
  }

  private slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '');
  }
}
