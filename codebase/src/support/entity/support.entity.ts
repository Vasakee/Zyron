import { InquiryPriority, InquiryStatus } from 'src/enum';
import { BaseEntity } from '../../common';
import { User } from '../../user/entity/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { SupportMessage } from './support-message.entity';

@Entity('support')
export class Support extends BaseEntity {
  @Column({ type: 'varchar' })
  userId: string;

  @Column({ type: 'varchar', default: null })
  assigneeId: string;

  @Column({ type: 'varchar', default: null })
  messageId: string;

  @Column({ type: 'varchar' })
  subject: string;

  @Column({ type: 'varchar' })
  inquiryId: string;

  @Column({ type: 'varchar', default: InquiryPriority.MEDIUM })
  priority: string;

  @Column({ type: 'varchar', default: InquiryStatus.PENDING })
  status: string;

  @Column({ type: 'text', default: null })
  message: string;

  @OneToMany(() => SupportMessage, (messages) => messages.supportId)
  messages: SupportMessage[];

  @ManyToOne(() => User, (user) => user.support, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => User, (user) => user.supportAssignees)
  @JoinColumn({ name: 'assigneeId' })
  assignedTo: User;
}
