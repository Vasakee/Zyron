import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Support } from '../../support/entity/support.entity';
import { SupportMessage } from '../../support/entity/support-message.entity';
import { User } from 'src/user/entity/user.entity';
import { SupportMessageDto } from 'src/support/dto/support-message.dto';
import { SenderType, SupoortMailStatus } from 'src/enum';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ReceiveMessageService {
  private readonly logger = new Logger(ReceiveMessageService.name);
  constructor(
    @InjectRepository(SupportMessage)
    private readonly supportMessageRepo: Repository<SupportMessage>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Support)
    private readonly supportRepo: Repository<Support>,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  async execute(inboundEmail: any) {

    try {
      const Dto = new SupportMessageDto();

      const messageId = inboundEmail?.References?.split(' ')[0];

      if (!messageId) {
        this.logger.warn('messageid not found');
        return;
      }

      this.logger.log(`Original MessageID: ${messageId}`);

      const supportrecord = await this.supportRepo.findOne({
        where: {
          messageId,
        },
        relations: ['assignedTo'],
      });

      if (!supportrecord || !supportrecord.userId) {
        this.logger.warn(`supportrecord or userId not found for ${messageId}`);
        return;
      }

      const userRecord = await this.userRepo.findOne({
        where: {
          id: supportrecord.userId,
        },
      });

      if (!userRecord) {
        this.logger.warn(
          `userRecord not found for ${JSON.stringify(supportrecord)}`,
        );
        return;
      }

      const userId = userRecord.id;

      Dto.content = inboundEmail['stripped-text'];
      Dto.sender = SenderType.CUSTOMER;
      Dto.supportId = supportrecord.id;
      Dto.userId = userId;

      const data = {
        content: inboundEmail['stripped-text'],
        sender: SenderType.CUSTOMER,
        supportId: supportrecord.id,
        userId: userId,
        status: SupoortMailStatus.SENT,
      };

      const payload = Dto.toEntity(data as SupportMessageDto);

      const result = await this.supportMessageRepo.save(payload);

      const mailData = {
        name: supportrecord.assignedTo.firstName,
        email: supportrecord.assignedTo.email,
        id: supportrecord.id,
        assignedTo: supportrecord.assignedTo.id,
        status: supportrecord.status,
        priority: supportrecord.priority,
        subject: supportrecord.subject,
        caseId: supportrecord.inquiryId,
      };

      this.eventEmitter.emit('message.admin', mailData);

      return Dto.fromEntity(result);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
  public extractMessageId(inReplyTo: string): string | null {
    if (!inReplyTo) {
      this.logger.warn('No Message-ID or In-Reply-To header found');
      return null;
    }
    const regex = /<([^@]+)@/;
    const match = inReplyTo?.match(regex);
    return match ? match[1] : null;
  }
}
