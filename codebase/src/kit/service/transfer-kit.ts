import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, QueryFailedError } from 'typeorm';
import { Kit } from '../entity/kit.entity';
import { PractitionerKit } from '../entity/practitioner-kits.entity';
import { User } from 'src/user/entity/user.entity';
import { TransferKitDto } from '../dto/transfer-kit.dto';
import { ConflictErrorException, NotFoundErrorException } from 'src/common';
import { AccountRoles } from 'src/enum';

@Injectable()
export class TransferKitService {
  private readonly logger = new Logger(TransferKitService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async execute(data: TransferKitDto) {
    try {
      const practitionerUser: User = await this.userRepo.findOne({
        where: {
          email: data.email,
          role: AccountRoles.PRACTITIONER,
        },
        relations: ['practitioner'],
      });

      if (!practitionerUser || !practitionerUser.practitioner) {
        throw new NotFoundErrorException(
          'Practitioner not found with the provided email',
        );
      }

      return await this.dataSource.transaction(async (manager) => {
        const kit = await manager.getRepository(Kit).findOne({
          where: { kitNumber: data.kitId },
          relations: ['user'],
        });

        if (!kit) {
          throw new NotFoundErrorException(
            'Kit not found with the provided ID',
          );
        }

        if (!kit.user) {
          throw new ConflictErrorException(
            'Kit does not have an associated customer user',
          );
        }

        const existingPractitionerKit = await manager
          .getRepository(PractitionerKit)
          .findOne({
            where: { kitNumber: kit.kitNumber },
          });

        if (existingPractitionerKit) {
          throw new ConflictErrorException(
            'Kit has already been transferred to a practitioner',
          );
        }

        const practitionerKit = manager.getRepository(PractitionerKit).create({
          practitionerId: practitionerUser.practitioner.id,
          name: data.name,
          status: kit.status,
          kitType: kit.kitType,
          dateOfSampleCollection: kit.dateOfSampleCollection,
          dateReceivedByLab: kit.dateReceivedByLab,
          resultsAvailable: kit.resultsAvailable,
          lockStatus: kit.lockStatus,
          pdfUrl: kit.pdfUrl,
          taxonomyUrl: kit.taxonomyUrl,
          summaryUrl: kit.summaryUrl,
          fastQUrl: kit.fastQUrl,
          amrUrl: kit.amrUrl,
          kitNumber: kit.kitNumber,
          healthInfoCompleted: kit.healthInfoCompleted,
          submitted: kit.submitted,
          isSent: false,
        });

        const savedPractitionerKit = await manager
          .getRepository(PractitionerKit)
          .save(practitionerKit);

        await manager.getRepository(Kit).delete({ id: kit.id });

        this.logger.log(
          `Kit ${kit.kitNumber} successfully transferred from user ${
            kit.user?.id ?? kit.userId
          } to practitioner ${practitionerUser.practitioner.id}`,
        );

        return {
          message: 'Kit transferred successfully',
          practitionerKit: {
            id: savedPractitionerKit.id,
            kitNumber: savedPractitionerKit.kitNumber,
            practitionerId: savedPractitionerKit.practitionerId,
            name: savedPractitionerKit.name,
            status: savedPractitionerKit.status,
          },
        };
      });
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const driverError = (error as any).driverError;
        if (
          driverError &&
          (driverError.number === 2627 || driverError.number === 2601)
        ) {
          throw new ConflictErrorException(
            'Kit has already been transferred to a practitioner',
          );
        }
      }
      this.logger.error(
        `Error transferring kit: ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }
}
