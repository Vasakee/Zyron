import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportDto } from '../dto/support.dto';
import { Support } from '../entity/support.entity';
import { SupportMessage } from '../entity/support-message.entity';

@Injectable()
export class GetSingleCaseService {
  private readonly logger = new Logger(GetSingleCaseService.name);
  constructor(
    @InjectRepository(Support)
    private readonly supportRepo: Repository<Support>,
    @InjectRepository(SupportMessage)
    private readonly supportMessageRepo: Repository<SupportMessage>,
  ) {}
  async execute(id: string) {
    try {
      const support = await this.supportRepo.findOne({
        where: { id },
        relations: ['user', 'assignedTo'],
      });

      const messages = await this.supportMessageRepo.find({
        where: { supportId: support.id },
        relations: ['user'],
      });

      return new SupportDto().fromSingleEntity(support, messages);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
