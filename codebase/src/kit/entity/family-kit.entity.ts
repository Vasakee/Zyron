import { BaseEntity } from 'src/common';
import { KitStatus } from 'src/enum';
import { User } from 'src/user/entity/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('family-kits')
export class FamilyKit extends BaseEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', default: KitStatus.REGISTERED })
  status: string;

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

  @Column({ type: 'varchar', default: null })
  taxonomyUrl: string;

  @Column({ type: 'varchar', default: null })
  summaryUrl: string;

  @Column({ type: 'varchar', default: null })
  fastQUrl: string;

  @Column({ type: 'varchar', unique: true })
  kitNumber: string;

  @ManyToOne(() => User, (user) => user.familyKit, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
