/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { CompleteClientRegistrationDto } from '../dto/customer-account.dto';
import { verifyAccessTokenForSignUp } from 'src/common/utils';
import { IdentifierType } from 'src/enum';
import { NotFoundErrorException } from 'src/common';
import { ExternalPractitioner } from 'src/practitioner/entity/external-practitioner.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FRONTEND_URL } from 'src/config';

@Injectable()
export class CompleteCustomerRegistration {
  private readonly logger = new Logger(CompleteCustomerRegistration.name);
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(ExternalPractitioner)
    private readonly externalPractitionerRepo: Repository<ExternalPractitioner>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(data: CompleteClientRegistrationDto) {
    try {
      const id = await this.getUserId(data);

      const userRecord = await this.userRepo.findOne({
        where: { id },
      });

      if (!userRecord) {
        throw new NotFoundErrorException('Account does not exist');
      }

      const registrationDto = new CompleteClientRegistrationDto();
      let practitionerMailData;
      if (data.practitionerId === 'not-found') {
        const practitionerRecord = await this.findPractitionerByEmail(
          data.practitionerEmail,
        );
        if (practitionerRecord) {
          data.practitionerId = practitionerRecord.id;
        } else {
          const externalPractitionerPayload =
            registrationDto.toExternalPractitionerEntity(data, userRecord.id);

          await this.externalPractitionerRepo.save(externalPractitionerPayload);
          if (externalPractitionerPayload.email) {
            practitionerMailData = { 
              email: data.practitionerEmail,
              name : data.practitionerFirstName,
              link: `${FRONTEND_URL}/practitioner-registration`,
            };

            this.eventEmitter.emit('invite.practitioner', practitionerMailData);
          }
        }
      }

      const payload = registrationDto.updateEntity(userRecord, data);
      const result = await this.userRepo.save(payload);
      return registrationDto.fromEntity(result);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  private async getUserId(
    data: CompleteClientRegistrationDto,
  ): Promise<string> {
    if (data.identifierType === IdentifierType.TOKEN) {
      const decoded = await verifyAccessTokenForSignUp(
        data.identifier,
        'user_access_key',
      );
      return decoded['id'];
    }
    return data.identifier;
  }

  private async findPractitionerByEmail(
    email: string,
  ): Promise<User | undefined> {
    return this.userRepo.findOne({ where: { email } });
  }
}
  