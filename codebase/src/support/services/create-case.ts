import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { SupportDto } from '../dto/support.dto';
import { Support } from '../entity/support.entity';
import { User } from 'src/user/entity/user.entity';

@Injectable()
export class CreateCaseService {
  private readonly logger = new Logger(CreateCaseService.name);
  constructor(
    @InjectRepository(Support)
    private readonly supportRepo: Repository<Support>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  async execute(data: SupportDto) {
    try {
      const Dto = new SupportDto();
      const payload = Dto.toEntity(data);

      const [result, user] = await Promise.all([
        this.supportRepo.save(payload),
        this.userRepo.findOne({ where: { id: data.userId } }),
      ]);

      const mailData = {
        name: user.firstName,
        email: user.email,
        subject: data.subject,
        supportId: result.id,
      };

      this.eventEmitter.emit('support.initial.response', mailData);

      return Dto.fromEntity(result);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
