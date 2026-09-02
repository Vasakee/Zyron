import { BaseEntity } from 'src/common';
import { DispatchStatus } from 'src/enum';
import { Entity, Column, Index, Unique } from 'typeorm';

@Entity('health_information_dispatch_logs')
@Unique(['orderId', 'kitId'])
@Index(['status', 'registeredAt'])
export class HealthInformationDispatchLog extends BaseEntity {
  @Column({ type: 'uuid' })
  @Index()
  orderId: string;

  @Column({ type: 'varchar' })
  kitId: string;

  @Column({ type: 'uuid' })
  practitionerId: string;

  @Column({ type: 'varchar' })
  recipientEmail: string;

  @Column({ type: 'datetime2' })
  registeredAt: Date;

  @Column({ type: 'varchar', default: DispatchStatus.PENDING })
  status: string;

  @Column({ type: 'datetime2', nullable: true })
  sentAt: Date;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ type: 'datetime2', nullable: true })
  lastAttemptedAt: Date;

  @Column({ type: 'text', nullable: true })
  lastError: string;
}
