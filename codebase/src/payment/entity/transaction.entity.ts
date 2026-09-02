import { PaymentGateway, PaymentType, TransactionStatus } from 'src/enum';
import { BaseEntity } from '../../common/entity/base.entity';
import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { User } from 'src/user/entity/user.entity';

@Entity({ name: 'transactions' })
export class Transaction extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  referenceId: string;

  @Column({ type: 'varchar', nullable: true })
  userId: string;

  @Column({ type: 'varchar', default: PaymentType.Pay })
  type: string;

  @Column({ type: 'varchar', default: TransactionStatus.Pending })
  status: string;

  @Column({ type: 'varchar', default: PaymentGateway.Stripe })
  gateway: string;

  // Payment amounts and currency
  @Column({ type: 'bigint', default: 0 })
  amount: number;

  @Column({ type: 'varchar', default: 'usd' })
  currency: string;

  // Stripe references
  @Column({ type: 'varchar', nullable: true })
  stripeInvoiceId: string;

  @Column({ type: 'varchar', nullable: true })
  promotionCodeId: string; // Stripe promotion_code id

  @Column({ type: 'varchar', nullable: true })
  sessionId: string;

  @Column({ type: 'varchar', nullable: true })
  paymentIntentId: string;

  @Column({ type: 'datetime', nullable: true })
  paidAt: Date;

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  metadata: string;

  @ManyToOne(() => User, (user) => user.transaction, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
