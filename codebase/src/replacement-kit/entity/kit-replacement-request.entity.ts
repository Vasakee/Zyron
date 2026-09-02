import { BaseEntity } from 'src/common';
import { Column, Entity, Index } from 'typeorm';
import {
  AllowedCountriesAbbrev,
  ReplacementKitStatus,
  ReplacementKitTargetType,
} from 'src/enum';

@Entity('kit_replacement_requests')
export class KitReplacementRequest extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  referenceId: string;

  @Column({ type: 'varchar', length: 30 })
  targetType: ReplacementKitTargetType; // PRACTITIONER | CLIENT

  @Index()
  @Column({ type: 'uuid', nullable: true })
  practitionerId: string | null;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 50 })
  kitType: string;

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'varchar', length: 50 })
  country: AllowedCountriesAbbrev;

  @Column({ type: 'varchar', length: 255 })
  addressLineOne: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  addressLineTwo: string | null;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100 })
  state: string;

  @Column({ type: 'varchar', length: 20 })
  postalCode: string;

  @Index()
  @Column({ type: 'varchar', length: 30 })
  status: ReplacementKitStatus; // PENDING_PAYMENT | PAID | CANCELLED | EXPIRED

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  paymentUrl: string | null;

  // Optional: cache session id for idempotency/debug
  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentSessionId?: string | null;

  @Column({ type: 'datetime', nullable: true })
  paymentDate?: Date | null;

  @Column({ type: 'uuid' })
  createdByAdminId: string;
}
