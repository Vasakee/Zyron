import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Kit } from 'src/kit/entity/kit.entity';
import { In, Repository } from 'typeorm';
import { GetKits } from '../api/requests/get-kits';
import { GetReportFilesService } from './get-report-files';
import { User } from 'src/user/entity/user.entity';
import { KitStatus, LockStatus } from 'src/enum';

interface KitInterface {
  name: string;
  kitId: string;
  status: string;
  identifier: string;
  collected?: Date | null;
  received: Date | null;
  expected: Date | null;
  available: Date | null;
  email?: string | null;
  resolved?: boolean;
}

@Injectable()
export class MigrateKitService {
  private readonly logger = new Logger(MigrateKitService.name);

  constructor(
    @InjectRepository(Kit)
    private readonly kitRepo: Repository<Kit>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly getReportFilesService: GetReportFilesService,
  ) {}

  async execute() {
    try {
      const [oldKits, users] = await Promise.all([
        GetKits() as Promise<KitInterface[]>,
        this.userRepo.find(),
      ]);

      const userMap = new Map(users.map(user => [user.email, user]));

      const kitIds = oldKits.map(kit => kit.kitId);
      console.log(kitIds.length)
      const existingKits = await this.kitRepo.find({
        where: { kitNumber: In(kitIds) },
      });
      const existingKitMap = new Map(existingKits.map(kit => [kit.kitNumber, kit]));

      let existingCount = 0

      const migratePromises = oldKits.map(async oldKit => {
        if (oldKit.resolved) {
          const user = userMap.get(oldKit.email);
          const { pdfUrl, csvUrl, fastQUrl } = await this.getReportFilesService.execute(oldKit.kitId);

          const existingKit = existingKitMap.get(oldKit.kitId);
          const kitStatus = this.getKitStatus(oldKit.status);

          if (existingKit) {
            existingCount++
            existingKit.status = kitStatus;
            existingKit.dateOfSampleCollection = oldKit.collected;
            existingKit.dateReceivedByLab = oldKit.received;
            existingKit.resultsAvailable = oldKit.available;
            existingKit.lockStatus = LockStatus.UNLOCKED;
            existingKit.pdfUrl = pdfUrl;
            existingKit.summaryUrl = csvUrl;
            existingKit.fastQUrl = fastQUrl;

            await this.kitRepo.save(existingKit);
          } else {
            const newKit = this.kitRepo.create({
              userId: user.id,
              status: kitStatus,
              dateOfSampleCollection: oldKit.collected,
              dateReceivedByLab: oldKit.received,
              resultsAvailable: oldKit.available,
              lockStatus: LockStatus.UNLOCKED,
              pdfUrl,
              summaryUrl: csvUrl,
              fastQUrl,
              kitNumber: oldKit.kitId,
            });

            await this.kitRepo.save(newKit);
          }
        }
      });

      console.log(existingCount)

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
