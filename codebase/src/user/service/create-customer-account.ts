/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { CreateCustomerAccountDto } from '../dto/customer-account.dto';
import { ConflictErrorException } from 'src/common';
import { generateAccessTokenForSignUp, hashPassword } from 'src/common/utils';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ExternalPractitioner } from 'src/practitioner/entity/external-practitioner.entity';
import { FRONTEND_URL } from 'src/config';

@Injectable()
export class CreateCustomerAccountService {
  private readonly logger = new Logger(CreateCustomerAccountService.name);
  public Dto = new CreateCustomerAccountDto();
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(ExternalPractitioner)
    private readonly externalPractitionerRepo: Repository<ExternalPractitioner>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(data: CreateCustomerAccountDto) {
    try {
      const userRecord = await this.userRepo.findOne({
        where: { email: data.email },
      });

      if (userRecord) {
        throw new ConflictErrorException('Account already exists');
      }

      if (data.practitionerId === 'not-found') {
        const practitionerRecord = await this.userRepo.findOne({
          where: { email: data.practitionerEmail },
        });

        if (practitionerRecord) {
          data.practitionerId = practitionerRecord.id;
          const result = await this.handleAccounCreation(data);
          return result;
        } else {
          const result = await this.handleAccounCreation(data);

          const externalPractitionerPayload =
            this.Dto.toExternalPractitionerEntity(data, result.id);

          await this.externalPractitionerRepo.save(externalPractitionerPayload);

          if (externalPractitionerPayload.email) {
           
           const  practitionerMailData = { 
              email: data.practitionerEmail,
              name : data.practitionerFirstName,
              link: `${FRONTEND_URL}/practitioner-registration`,
            };

            this.eventEmitter.emit('invite.practitioner', practitionerMailData);
          }
          return result;
        }
      }

      const result = await this.handleAccounCreation(data);
      return result;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  private async handleAccounCreation(data: CreateCustomerAccountDto) {
    const passwordHash = await hashPassword(data.password);
    const payload = this.Dto.toEntity(data, passwordHash);

    const result = await this.userRepo.save(payload);

    const signUpToken = await generateAccessTokenForSignUp(
      { id: result.id },
      'user_access_key',
    );

    const mailData = {
      name: result.firstName,
      email: result.email,
      signUpToken,
    };

    this.eventEmitter.emit('verify.account', mailData);

    return this.Dto.fromEntity(result);
  }
}
