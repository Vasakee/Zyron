import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { UpdateCustomerAccountDto } from '../dto/update-account.dto';
import { ExternalPractitioner } from 'src/practitioner/entity/external-practitioner.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundErrorException } from 'src/common';
import { FRONTEND_URL } from 'src/config';

@Injectable()
export class UpdateAccountService {
  private readonly logger = new Logger(UpdateAccountService.name);
  public updateAccountDto = new UpdateCustomerAccountDto();
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(ExternalPractitioner)
    private readonly externalPractitionerRepo: Repository<ExternalPractitioner>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string, data: UpdateCustomerAccountDto) {
    try {
      const userRecord = await this.getUserRecord(id);

      if (!userRecord) {
        throw new NotFoundErrorException('Account does not exist');
      }

      await this.updatePractitionerInfo(userRecord, data);

      const payload = this.updateAccountDto.toEntity(data, userRecord);
      return this.userRepo.save(payload);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  private async getUserRecord(id: string): Promise<User | undefined> {
    return this.userRepo.findOne({
      where: { id },
      select: ['id', 'lastName', 'firstName', 'recommended', 'phone'],
      relations: ['clientExternalPractitioner', 'clientPractitioners'],
    });
  }

  private async updatePractitionerInfo(
    userRecord: User,
    data: UpdateCustomerAccountDto,
  ) {
    if (data.practitionerId === 'not-found') {
      await this.handleNotFoundPractitioner(userRecord, data);
    } else if (
      // userRecord.clientExternalPractitioner &&
      data.practitionerId !== 'not-found'
    ) {
      userRecord.clientExternalPractitioner = null;
    }
  }

  private async handleNotFoundPractitioner(
    userRecord: User,
    data: UpdateCustomerAccountDto,
  ) {
    userRecord.clientPractitioners = [];
    const [externalPractitionerRecord] = await Promise.all([
      this.externalPractitionerRepo.findOne({
        where: { userId: userRecord.id },
      }),
    ]);

    await this.saveOrUpdateExternalPractitioner(
      userRecord,
      data,
      externalPractitionerRecord,
    );
  }

  private async saveOrUpdateExternalPractitioner(
    userRecord: User,
    data: UpdateCustomerAccountDto,
    externalPractitionerRecord?: ExternalPractitioner,
  ) {
    if (externalPractitionerRecord) {
      const externalPractitionerPayload =
        this.updateAccountDto.updateExternalPractitionerEntity(
          data,
          externalPractitionerRecord,
        );
      await this.externalPractitionerRepo.save(externalPractitionerPayload);
    } else {
      const externalPractitionerPayload =
        this.updateAccountDto.toExternalPractitionerEntity(data, userRecord.id);
      userRecord.clientExternalPractitioner = externalPractitionerPayload;
      if (externalPractitionerPayload.email) {
        const practitionerMailData = {
          email: data.practitionerEmail,
          name: data.practitionerFirstName,
          link: `${FRONTEND_URL}/practitioner-registration`,
        };

        this.eventEmitter.emit('invite.practitioner', practitionerMailData);
      }
    }
  }
}
