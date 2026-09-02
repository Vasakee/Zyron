import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePractitionerAccountDto } from '../dto/create-practitioner-dto';
import { ConflictErrorException } from 'src/common';
import { generateAccessTokenForSignUp, hashPassword } from 'src/common/utils';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from 'src/user/entity/user.entity';
import { ExternalPractitioner } from '../entity/external-practitioner.entity';
import { ClientPractitioner } from '../entity/client-practitioner.entity';

@Injectable()
export class CreatePractitionerAccountService {
  private readonly logger = new Logger(CreatePractitionerAccountService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(ExternalPractitioner)
    private readonly externalPractitionerRepo: Repository<ExternalPractitioner>,
    @InjectRepository(ClientPractitioner)
    private readonly clientPractitionerRepo: Repository<ClientPractitioner>,
  ) {}

  async execute(data: CreatePractitionerAccountDto) {
    try {
      const practitionerRecord = await this.userRepo.findOne({
        where: {
          email: data.email,
        },
      });

      if (practitionerRecord) {
        throw new ConflictErrorException('Account already exists');
      }

      const passwordHash = await hashPassword(data.password);

      const Dto = new CreatePractitionerAccountDto();
      const payload = Dto.toEntity(data, passwordHash);
      const result = await this.userRepo.save(payload);

      const externalPractitionerRecord =
        await this.externalPractitionerRepo.findOne({
          where: {
            email: result.email,
          },
        });

      if (externalPractitionerRecord) {
        await this.clientPractitionerRepo.save({
          practitionerId: result.practitioner.id,
          userId: externalPractitionerRecord.userId,
        });

        await this.externalPractitionerRepo.delete({
          email: result.email,
        });
      }
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

      return Dto.fromEntity(result);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
