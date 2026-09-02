import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  In,
  Repository,
} from 'typeorm';
import { SupportDto, SupportQueryDto } from '../dto/support.dto';
import { Support } from '../entity/support.entity';
import {
  ConflictErrorException,
  PageMetaDto,
  PageOptionsDto,
} from 'src/common';
import { UpdateSupportDto } from '../dto/update-support.dto';
import { User } from 'src/user/entity/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AccountRoles, InquiryStatus } from 'src/enum';

@Injectable()
export class AssignCaseStatusService {
  private readonly logger = new Logger(AssignCaseStatusService.name);

  constructor(
    @InjectRepository(Support)
    private readonly supportRepo: Repository<Support>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  async execute(data: UpdateSupportDto, id) {
    try {
      const supportRecord = await this.supportRepo.findOne({
        where: { id: id },
      });
      if (!supportRecord) {
        throw new ConflictErrorException('Case not found');
      }
      const role = AccountRoles.ADMIN;
      const userRecord = await this.userRepo.findOne({
        where: { id: data.assigneeId, role: role },
      });
      if (!userRecord) {
        throw new ConflictErrorException('User not admin');
      }

      const Dto = new UpdateSupportDto();
      const payload = Dto.updateEntityI(supportRecord, data);

      if (
        data.status === InquiryStatus.PENDING ||
        data.status === InquiryStatus.OPEN
      ) {
        const mailData = {
          email: userRecord.email,
          name: userRecord.firstName,
          caseId: supportRecord.inquiryId,
        };
        this.eventEmitter.emit('notify.admin', mailData);

        console.log(mailData);
      }
      const result = await this.supportRepo.save(payload);

      return Dto.fromEntity(result);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
