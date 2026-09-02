import { BaseEntity } from 'src/common';
import {
  DeliveryStatus,
  DeliveryMode,
  KitType,
  OrderRegistrationStatus,
  OrderStatus,
  Source,
  InvoicingMode,
  OrderType,
} from 'src/enum';
import { User } from 'src/user/entity/user.entity';
import { PaymentStatementItem } from 'src/payment/entity/payment-statement-item.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { OrderKit } from './order-kit.entity';
import { ExtraShippingPackage } from './shipping-package.entity';

@Entity('orders')
export class Order extends BaseEntity {
  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @Column({ type: 'varchar', unique: true })
  referenceId: string;

  @Column({ type: 'varchar', nullable: true })
  finalReferenceId: string;

  @Column({ nullable: true, type: 'varchar' })
  firstName: string | null;

  @Column({
    type: 'varchar',
    default: OrderRegistrationStatus.NO,
  })
  registrationStatus: string;

  @Column({ type: 'varchar', nullable: true })
  kitId: string;

  @Column({ type: 'varchar', nullable: true })
  registeredBy: string;

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
    type: 'bit',
    default: 0,
  })
  trackingEmailStatus: boolean | number;

  @Column({
    type: 'varchar',
    default: DeliveryStatus.NO,
  })
  delivered: string;

  @Column({ type: 'varchar', nullable: true })
  lastName: string | null;

  @Column({ nullable: true, type: 'varchar' })
  email: string | null;

  @Column({ type: 'varchar', default: OrderStatus.Pending })
  status: string;

  @Column({ type: 'varchar', default: KitType.GutScan })
  kitType: string;

  @Column({ type: 'varchar' })
  country: string;

  @Column({ type: 'varchar', nullable: true })
  subPractitionerName: string | null;

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

  @Column({ type: 'varchar', default: Source.Platform })
  source: string;

  @Column({ type: 'bigint', default: 1 })
  quantity: number;

  // Pricing and invoicing fields
  @Column({ type: 'varchar', default: 'usd' })
  currency: string;

  @Column({ type: 'bigint', default: 0 })
  amountSubtotal: number; // pre-discount

  @Column({ type: 'bigint', default: 0 })
  amountDiscount: number;

  @Column({ type: 'bigint', default: 0 })
  amountTax: number;

  @Column({ type: 'bigint', default: 0 })
  amountTotal: number; // final paid amount

  @Column({ type: 'varchar', nullable: true })
  promotionCode: string; // human code like SAVE20

  @Column({ type: 'varchar', nullable: true })
  promotionCodeId: string; // Stripe promotion_code id

  @Column({ type: 'varchar', nullable: true })
  invoiceId: string; // Stripe invoice id

  @Column({ type: 'varchar', nullable: true })
  invoiceNumber: string; // Human-readable invoice number

  @Column({ type: 'varchar', default: InvoicingMode.EOM })
  invoicingMode: string; // enum: EOM, Immediate (default EOM)

  @Column({ type: 'varchar', default: OrderType.PayAsYouGo })
  orderType: string; // enum: PayAsYouGo, Bulk, KitOnSite (default KitOnSite)

  @Column({ type: 'varchar', default: DeliveryMode.DROPSHIP })
  deliveryMode: string; // enum: DROPSHIP, ON_SITE (default DROPSHIP)

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  paymentUrl: string;

  @Column({
    type: 'datetime',
    default: null,
  })
  completedAt: Date;

  @ManyToOne(() => User, (user) => user.order, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => OrderKit, (orderKit) => orderKit.order, {
    cascade: true,
  })
  orderKits?: OrderKit[];

  @OneToMany(() => ExtraShippingPackage, (pkg) => pkg.order, {
    cascade: true,
    eager: true,
  })
  extraPackages: ExtraShippingPackage[];

  @OneToOne(() => PaymentStatementItem, (item) => item.order, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  paymentStatementItem: PaymentStatementItem;
}
