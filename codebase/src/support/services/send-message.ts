import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Support } from '../entity/support.entity';
import { SupportMessageDto } from '../dto/support-message.dto';
import { SupportMessage } from '../entity/support-message.entity';
import { User } from 'src/user/entity/user.entity';
import { AccountRoles, SenderType } from 'src/enum';
import * as uuid from 'uuid';
import { BadRequestErrorException } from 'src/common';

@Injectable()
export class SendMessageService {
  private readonly logger = new Logger(SendMessageService.name);
  constructor(
    @InjectRepository(SupportMessage)
    private readonly supportMessageRepo: Repository<SupportMessage>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Support)
    private readonly supportRepo: Repository<Support>,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  async execute(userId: string, data: SupportMessageDto) {
    try {
      const Dto = new SupportMessageDto();
      data.sender = SenderType.ADMIN;
      console.log(data);
      const payload = Dto.toEntity(data);

      const messageId = uuid.v4();

      const [user, support] = await Promise.all([
        this.userRepo.findOne({
          where: {
            id: userId,
            role: In([AccountRoles.ADMIN, AccountRoles.SUPER_ADMIN]),
          },
        }),

        this.supportRepo.findOne({
          where: { id: data.supportId },
          relations: ['user', 'assignedTo'],
        }),

        ,
      ]);

      if (support.assignedTo === null) {
        throw new BadRequestErrorException(
          'Support must be assigneed to admin to send a message',
        );
      }

      const result = await this.supportMessageRepo.save(payload);

      const mailData = {
        name: support.user.firstName,
        email: support.user.email,
        subject: support.subject,
        senderEmail: user.email,
        supportId: support.id,
        supportMessageId: result.id,
        messageId,
        initialMessageId: support.messageId,
        content: data.content,
      };

      this.eventEmitter.emit('support.response', mailData);

      return Dto.fromEntity(result);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
