import { BaseEntity } from '../../common/entity/base.entity';
import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'feedback' })
export class Feedback extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  sessionId: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  referenceEmail: string;

  @Column({ type: 'varchar', nullable: true })
  code: string;

  @Column({ type: 'varchar', nullable: true })
  source: string;

  @Column({ type: 'varchar', nullable: true })
  awarenessChannel: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'int', nullable: true })
  satisfaction: number;
}
