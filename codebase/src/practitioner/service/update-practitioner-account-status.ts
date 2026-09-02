/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Practitioner } from '../entity/practitioner.entity';
import { UpdatePractitionerAccountDto } from '../dto/update-practitioner.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from 'src/user/entity/user.entity';
import { PractitionerAccountStatus, PractitionerStatus } from 'src/enum';
import { UpdatePractitionerAccountStatusDto } from '../dto/update-practitioner-status.dto';

@Injectable()
export class UpdatePractitionerStatusService {
  private readonly logger = new Logger(UpdatePractitionerStatusService.name);
  constructor(
    @InjectRepository(Practitioner)
    private readonly practitionerRepo: Repository<Practitioner>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string, data: UpdatePractitionerAccountStatusDto) {
    const practitioner = await this.practitionerRepo.findOne({
      where: { id },
      relations: ['user'],
      // select: ['id', 'status'],
    });
     console.log(practitioner)
    const Dto = new UpdatePractitionerAccountStatusDto();

    console.log('Current Practitioner Status:', practitioner.status);
    console.log('New Status:', data.status);

    const payload = Dto.toEntity(practitioner, data);

    await this.practitionerRepo.save(payload);

    const mailData = {
      email: practitioner.user.email,
      name : practitioner.user.firstName,
    };

    
    if ((data.status === PractitionerAccountStatus.Approved)) {
      console.log('Emitting accept.practitioner event');
      this.eventEmitter.emit('accept.practitioner', mailData);
    } else if ((data.status === PractitionerAccountStatus.Rejected)) {
      console.log('Emitting decline.practitioner event');
      this.eventEmitter.emit('decline.practitioner', mailData);
    }else{
      console.log('No matching status for event emission');
    }

    if(practitioner.monthlyClients === '1_-_5' || practitioner.monthlyClients === '6_-_10'){
        this.eventEmitter.emit('accept.practitioner11', mailData);
        console.log('Emitting accept.practitioner11 event');
    }else if(practitioner.monthlyClients === '11_-_30' || practitioner.monthlyClients === '30_and_above'){
      this.eventEmitter.emit('accept.practitioner12', mailData);
      console.log('Emitting accept.practitioner12 event');
    }else{
      console.log('No matching status for event emission');


  }
}
}