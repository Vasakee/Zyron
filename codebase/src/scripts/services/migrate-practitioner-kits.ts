import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { GetReportFilesService } from './get-report-files';
import { KitStatus, LockStatus } from 'src/enum';
import { PractitionerKit } from 'src/kit/entity/practitioner-kits.entity';
import { GetPractitionerKits } from '../api/requests/get-practitioner-kits';
import { Practitioner } from 'src/practitioner/entity/practitioner.entity';

interface PractitionerKitInterface {
  name: string | null;
  kitId: string;
  identifier: string | null;
  status: string | null;
  collected?: Date | null;
  received: Date | null;
  expected: Date | null;
  available: Date | null;
  practitionerEmail?: string;
  practitionerName?: string;
}

@Injectable()
export class MigratePractitionerKitService {
  private readonly logger = new Logger(MigratePractitionerKitService.name);

  constructor(
    @InjectRepository(PractitionerKit)
    private readonly practitionerKitRepo: Repository<PractitionerKit>,
    @InjectRepository(Practitioner)
    private readonly practitionerRepo: Repository<Practitioner>,
    private readonly getReportFilesService: GetReportFilesService,
  ) {}

  async execute() {
    try {
      const [practitionerKits, practitioners] = await Promise.all([
        GetPractitionerKits() as Promise<PractitionerKitInterface[]>,
        this.practitionerRepo.find({ relations: ['user'] }),
      ]);

      const practitionerMap = new Map(
        practitioners.map((practitioner) => [
          practitioner.user.email,
          practitioner,
        ]),
      );

      const kitIds = practitionerKits.map(kit => kit.kitId);
      const existingPractitionerKits = await this.practitionerKitRepo.find({
        where: { kitNumber: In(kitIds) },
      });
      const existingKitMap = new Map(existingPractitionerKits.map(kit => [kit.kitNumber, kit]));

      const migratePromises = practitionerKits.map(async (practitionerKit: PractitionerKitInterface) => {
        const practitioner = practitionerMap.get(practitionerKit.practitionerEmail);
        const { pdfUrl, csvUrl, fastQUrl } = await this.getReportFilesService.execute(practitionerKit.kitId);

        if (!practitioner) {
          console.log(practitionerKit);
          return;
        }

        const existingKit = existingKitMap.get(practitionerKit.kitId);
        const kitStatus = this.getKitStatus(practitionerKit.status);

        if (existingKit) {
          existingKit.practitionerId = practitioner.id;
          existingKit.name = practitionerKit.name;
          existingKit.status = kitStatus;
          existingKit.dateOfSampleCollection = practitionerKit.collected;
          existingKit.dateReceivedByLab = practitionerKit.received;
          existingKit.resultsAvailable = practitionerKit.available;
          existingKit.lockStatus = LockStatus.UNLOCKED;
          existingKit.pdfUrl = pdfUrl;
          existingKit.summaryUrl = csvUrl;
          existingKit.fastQUrl = fastQUrl;

          await this.practitionerKitRepo.save(existingKit);
        } else {
          const newKit = this.practitionerKitRepo.create({
            practitionerId: practitioner.id,
            name: practitionerKit.name,
            status: kitStatus,
            dateOfSampleCollection: practitionerKit.collected,
            dateReceivedByLab: practitionerKit.received,
            resultsAvailable: practitionerKit.available,
            lockStatus: LockStatus.UNLOCKED,
            pdfUrl,
            summaryUrl: csvUrl,
            fastQUrl,
            kitNumber: practitionerKit.kitId,
          });

          await this.practitionerKitRepo.save(newKit);
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
