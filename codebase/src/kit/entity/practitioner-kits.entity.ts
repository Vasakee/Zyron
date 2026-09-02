import { BaseEntity } from 'src/common';
import { HealthInfoStatus, KitStatus, KitType } from 'src/enum';
import { Practitioner } from 'src/practitioner/entity/practitioner.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('practitioner-kits')
export class PractitionerKit extends BaseEntity {
  @Column({ type: 'uuid' })
  practitionerId: string;

  @Column({ type: 'varchar' })
  name: string;

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

  @Column({
    type: 'bit',
    default: 0,
  })
  isSent: boolean | number;

  @Column({
    type: 'bit',
    default: 0,
  })
  registeredViaAuto: boolean | number;

  @ManyToOne(
    () => Practitioner,
    (practitioner) => practitioner.practitionerKit,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'practitionerId' })
  practitioner: Practitioner;
}
