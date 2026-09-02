import { BaseEntity } from 'src/common';
import { CustomerProfileStatus, ProfileCreatorRole } from 'src/enum';
import { User } from 'src/user/entity/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('customer_profiles')
export class CustomerProfile extends BaseEntity {
  @Column({ type: 'uuid', nullable: false })
  userId?: string;

  @Column({ type: 'uuid', nullable: true })
  lastUpdatedById?: string;

  @Column({ nullable: false })
  clientName: string;

  @Column({ nullable: false, unique: true })
  kitId: string;

  @Column({ type: 'datetime', nullable: true })
  reportReleaseDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  vaariAnalysisDate?: Date;

  @Column({
    default: CustomerProfileStatus.PROCESSED,
  })
  status: CustomerProfileStatus;

  @Column({
    default: ProfileCreatorRole.PRACTITIONER,
  })
  createdByRole: ProfileCreatorRole;

  @Column({
    default: ProfileCreatorRole.PRACTITIONER,
  })
  lastUpdatedByRole: ProfileCreatorRole;

  @ManyToOne(() => User, (user) => user.customerProfiles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(
    () => User,
    (lastUpdatedBy) => lastUpdatedBy.customerProfileUpdatedBy,
  )
  @JoinColumn({ name: 'lastUpdatedById' })
  lastUpdatedBy: User;
}
