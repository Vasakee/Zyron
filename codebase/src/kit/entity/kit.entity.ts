import { HealthInfoStatus, KitStatus, KitType } from 'src/enum';
import { BaseEntity } from '../../common';
import { User } from '../../user/entity/user.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Index('nci_msft_1_kit_BAA0E6FB9B6C67E922CCF112ED6BB441', [
  'userId',
  'createdAt',
  'dateOfSampleCollection',
  'dateReceivedByLab',
  'fastQUrl',
  'healthInfoCompleted',
  'kitNumber',
  'kitType',
  'lockStatus',
  'pdfUrl',
  'resultsAvailable',
  'status',
  'submitted',
  'updatedAt',
])
@Entity('kit')
export class Kit extends BaseEntity {
  @Column({ type: 'uuid', default: null })
  userId: string;

  @Column({ type: 'varchar', default: KitStatus.REGISTERED })
  status: string;

  @Column({ type: 'varchar', default: KitType.GutScan })
  kitType: string;

  @Column({ type: 'datetime', default: null })
  dateOfSampleCollection: Date;

  @Column({ type: 'datetime', default: null })
  dateReceivedByLab: Date;

  @Column({ type: 'datetime', default: null })
  resultsAvailable: Date;

  @Column({ type: 'varchar', default: null })
  lockStatus: string;

  @Column({ type: 'varchar', default: null })
  pdfUrl: string;

  @Column({ type: 'nvarchar', length: 'max', default: null })
  taxonomyUrl: string;

  @Column({ type: 'varchar', default: null })
  summaryUrl: string;

  @Column({ type: 'varchar', default: null })
  fastQUrl: string;

  @Column({ type: 'nvarchar', length: 'max', default: null })
  amrUrl: string;

  @Column({ type: 'varchar', unique: true })
  kitNumber: string;

  @Column({
    type: 'varchar',
    default: HealthInfoStatus.NO,
  })
  healthInfoCompleted: string;

  @Column({
    type: 'bit',
    default: 0,
  })
  submitted: boolean | number;

  @ManyToOne(() => User, (user) => user.kit, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
