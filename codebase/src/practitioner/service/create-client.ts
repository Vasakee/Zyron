import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Practitioner } from '../entity/practitioner.entity';
import {
  generateAccessTokenForSignUp,
  generatePasswordResetToken,
  hashPassword,
} from 'src/common/utils';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateCustomerAccountDto } from 'src/user/dto/customer-account.dto';
import { User } from 'src/user/entity/user.entity';
import { CreateClienttDto } from '../dto/create-client.dto';
import { FRONTEND_URL } from 'src/config';
import { ConflictErrorException } from 'src/common';
import { ExternalPractitioner } from '../entity/external-practitioner.entity';
const generator = require('generate-password');

@Injectable()
export class CreateClientService {
  private readonly logger = new Logger(CreateClientService.name);
  public createClientDto = new CreateClienttDto();
  constructor(
    @InjectRepository(ExternalPractitioner)
    private readonly externalPractitionerRepo: Repository<ExternalPractitioner>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(data: CreateClienttDto) {
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
            this.createClientDto.toExternalPractitionerEntity(data, result.id);

          await this.externalPractitionerRepo.save(externalPractitionerPayload);

          if (externalPractitionerPayload.email) {
            const practitionerMailData = {
              email: data.practitionerEmail,
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

  private async handleAccounCreation(data: CreateClienttDto) {
    data.password = generator.generate({
      length: 10,
      numbers: true,
    });

    const passwordHash = await hashPassword(data.password);

    const token = generatePasswordResetToken();
    const hashedToken = await hashPassword(token);
    const payload = this.createClientDto.toEntity(
      data,
      passwordHash,
      hashedToken,
    );
    const result = await this.userRepo.save(payload);

    const link = `${FRONTEND_URL}/create-password?token=${token}&email=${result.email}`;
    const mailData = {
      name: `${result.firstName}`,
      email: result.email,
      link,
    };
    this.eventEmitter.emit('complete.registeration', mailData);

    return this.createClientDto.fromEntity(result);
  }
}
