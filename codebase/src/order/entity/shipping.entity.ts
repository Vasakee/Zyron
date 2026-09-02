import { DeliveryStatus, ShippingStatus } from 'src/enum';
import { BaseEntity } from '../../common/entity/base.entity';
import { Entity, Column } from 'typeorm';

@Entity({ name: 'shippings' })
export class Shipping extends BaseEntity {
  @Column({ type: 'varchar' })
  fullName: string;

  @Column({ type: 'varchar', unique: true })
  paymentIntentId: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ default: ShippingStatus.Pending })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  kitId: string;

  @Column({ type: 'datetime', nullable: true })
  shippingDate: Date;

  @Column({ type: 'varchar', nullable: true })
  trackingNumber: string;

  @Column({ type: 'varchar', nullable: true })
  trackingUrl: string;

  @Column({ type: 'datetime', nullable: true })
  expectedDeliveryDate: Date;

  @Column({ type: 'datetime', nullable: true })
  dateDelivered: Date;

  @Column({
    type: 'varchar',
    default: DeliveryStatus.NO,
  })
  delivered: string;

  @Column({ type: 'varchar' })
  country: string;

  @Column({ type: 'varchar' })
  addressLineOne: string;

  @Column({ type: 'varchar', nullable: true })
  addressLineTwo: string;

  @Column({ type: 'varchar' })
  city: string;

  @Column({ type: 'varchar' })
  state: string;

  @Column({ type: 'varchar' })
  postalCode: string;

  @Column({
    type: 'datetime',
    default: null,
  })
  completedAt: Date;
}
