import { BaseEntity } from 'src/common';
import { SupoortMailStatus } from 'src/enum';
import { Entity, Column } from 'typeorm';

@Entity('reminders')
export class Reminder extends BaseEntity {
  @Column({ unique: true })
  slug: string;

  @Column({ type: 'datetime' })
  date: Date;

  @Column({ type: 'varchar' })
  name: string;

  @Column({
    type: 'varchar',
    enum: SupoortMailStatus,
    default: SupoortMailStatus.PENDING,
  })
  status: string;
}
