import { Support } from 'src/support/entity/support.entity';
import { BaseEntity } from '../../common';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import { SupoortMailStatus } from 'src/enum';

@Entity('support-message')
export class SupportMessage extends BaseEntity {
  @Column({ type: 'varchar' })
  userId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar' })
  supportId: string;

  @Column({ type: 'varchar' })
  sender: string;

  @Column({ type: 'varchar', default: SupoortMailStatus.PENDING })
  status: string;

  @ManyToOne(() => Support, (support) => support.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'supportId' })
  support: Support;

  @ManyToOne(() => User, (user) => user.supportMessage)
  @JoinColumn({ name: 'userId' })
  user: User;
}
