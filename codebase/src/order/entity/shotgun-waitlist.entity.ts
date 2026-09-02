import { BaseEntity } from 'src/common';
import { Currency, Source, WaitlistStatus } from 'src/enum';
import { Entity, Column } from 'typeorm';

@Entity('shotgun-waitlist')
export class ShotgunWaitlist extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  referenceId: string;

  @Column({ type: 'varchar', nullable: true })
  finalReferenceId: string;

  @Column({ type: 'varchar', nullable: true })
  stripeCustomerId: string;

  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar', nullable: true })
  lastName: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar', default: WaitlistStatus.Pending })
  status: string;

  @Column({ type: 'varchar' })
  country: string;

  @Column({ type: 'varchar', default: Currency.USD })
  currency: Currency;

  @Column({ type: 'varchar', nullable: true })
  addressLineOne: string;

  @Column({ type: 'varchar', nullable: true })
  addressLineTwo: string;

  @Column({ type: 'varchar', nullable: true })
  city: string;

  @Column({ type: 'varchar', nullable: true })
  state: string;

  @Column({ type: 'varchar', nullable: true })
  postalCode: string;

  @Column({ type: 'varchar', default: Source.Waitlist })
  source: string;

  @Column({ type: 'bigint', default: 1 })
  quantity: number;

  @Column({
    type: 'datetime',
    default: null,
  })
  completedAt: Date;
}
