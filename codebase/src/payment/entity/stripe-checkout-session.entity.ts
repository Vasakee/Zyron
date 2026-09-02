import { BaseEntity } from 'src/common/entity/base.entity';
import { Entity, Column, Index } from 'typeorm';

@Entity({ name: 'stripe_checkout_sessions' })
export class StripeCheckoutSession extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar' })
  stripeSessionId: string;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  clientReferenceId: string;

  @Column({ type: 'varchar', nullable: true })
  customerId: string;

  @Column({ type: 'varchar', nullable: true })
  paymentIntentId: string;

  @Column({ type: 'varchar', nullable: true })
  subscriptionId: string;

  @Column({ type: 'varchar', nullable: true })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  paymentStatus: string;

  @Column({ type: 'varchar', nullable: true })
  mode: string;

  @Column({ type: 'bigint', nullable: true })
  amountSubtotal: number;

  @Column({ type: 'bigint', nullable: true })
  amountTotal: number;

  @Column({ type: 'varchar', nullable: true })
  currency: string;

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  url: string;

  @Column({ type: 'bigint', nullable: true })
  created: number;

  @Column({ type: 'bigint', nullable: true })
  expiresAt: number;

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  metadata: string;

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  raw: string;
}
