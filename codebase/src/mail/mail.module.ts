import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MailConsumer } from './mail-queue.processor';
import { MailController } from './mail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { Support } from 'src/support/entity/support.entity';
import { ReceiveMessageService } from './services/new-message';
import { SupportMessage } from 'src/support/entity/support-message.entity';
import { MessageAdminListener } from 'src/helper/listeners/message-admin';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mail',
    }),
    TypeOrmModule.forFeature([SupportMessage, User, Support]),
  ],
  providers: [MailConsumer, ReceiveMessageService, MessageAdminListener],
  controllers: [MailController],
})
export class MailModule {}
