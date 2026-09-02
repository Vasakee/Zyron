import { BaseEntity } from 'src/common';
import { User } from 'src/user/entity/user.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Entity('vaari_usage_events')
@Index(['userId', 'createdAt'])
export class VaariUsageEvent extends BaseEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ nullable: true })
  kitId: string | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
