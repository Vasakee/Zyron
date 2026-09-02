import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Support } from '../entity/support.entity';
import { BadRequestErrorException, ConflictErrorException } from 'src/common';
import { UpdateSupportDto } from '../dto/update-support.dto';
import { AccountRoles, InquiryStatus } from 'src/enum';
import { User } from 'src/user/entity/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UpdateCaseStatusService {
  private readonly logger = new Logger(UpdateCaseStatusService.name);
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

      if(!data.assigneeId){
        throw new BadRequestErrorException(
          'Please assign this case to an admin',
        );
      }

      const userRecord = await this.userRepo.findOne({
        where: { id: data.assigneeId, role: AccountRoles.ADMIN },
      });

      if (!userRecord) {
        throw new ConflictErrorException('User not admin');
      }

      if (!supportRecord) {
        throw new ConflictErrorException('Case not found');
      }

      const Dto = new UpdateSupportDto();

      const payload = Dto.updateEntityI(supportRecord, data);

      const result = await this.supportRepo.save(payload);

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

      return Dto.fromEntity(result);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
