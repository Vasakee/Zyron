import { BaseEntity } from 'src/common';
import { TransferStatus } from 'src/enum';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('transfer-logs')
export class Transfer extends BaseEntity {
  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @Column({ type: 'varchar' })
  oldEmail: string;

  @Column({ type: 'varchar' })
  newEmail: string;

  @Column({ type: 'varchar', default: null })
  oldToken: string;

  @Column({ type: 'varchar', default: null })
  newToken: string;

  @Column({ type: 'varchar', default: TransferStatus.PENDING })
  status: string;

  @Column({ type: 'bigint', default: null })
  newTokenExpiresAt: number;

  @Column({ type: 'bigint', default: null })
  oldTokenExpiresAt: number;

  @ManyToOne(() => User, (user) => user.transferLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
