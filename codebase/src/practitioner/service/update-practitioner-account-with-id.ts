/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Practitioner } from '../entity/practitioner.entity';
import { UpdatePractitionerAccountDto } from '../dto/update-practitioner.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from 'src/user/entity/user.entity';

@Injectable()
export class UpdatePractitionerAccountIdService {
  private readonly logger = new Logger(UpdatePractitionerAccountIdService.name);
  constructor(
    @InjectRepository(Practitioner)
    private readonly practitionerRepo: Repository<Practitioner>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string, data: UpdatePractitionerAccountDto) {
    const practitioner = await this.practitionerRepo.findOne({
      where: { id },
    
      
    });
    const Dto = new UpdatePractitionerAccountDto();
    const userPayload = Dto.toUserEntity( data);
    const practitionerPayload = Dto.toEntity(data);

    await Promise.all([
      this.userRepo.update(id, userPayload),
      this.practitionerRepo.update({ userId: id }, practitionerPayload),
    ]);
  }
}
