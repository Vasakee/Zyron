import { BaseEntity } from 'src/common/entity/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import { PaymentStatementInterval, PaymentStatementStatus } from 'src/enum';
import { PaymentStatementItem } from './payment-statement-item.entity';

@Index('IX_ps_status_periodEnd_userId_createdAt', [
  'status',
  'periodEnd',
  'userId',
  'createdAt',
])
@Index('IX_ps_status_updatedAt', ['status', 'updatedAt'])
@Index('IX_ps_claimable', [
  'status',
  'periodEnd',
  'nextAttemptAt',
  'userId',
  'currency',
  'createdAt',
])
@Index('IX_ps_finalized_invoice_claimable', [
  'status',
  'invoiceId',
  'nextAttemptAt',
  'createdAt',
])
@Index('IX_ps_expand_user_currency', [
  'userId',
  'currency',
  'status',
  'periodEnd',
  'nextAttemptAt',
])
@Index('IX_ps_createdAt_id', { synchronize: false })
@Index('IX_ps_user_createdAt_id', { synchronize: false })
@Index('IX_ps_user_invoice_createdAt_id', { synchronize: false })
@Index('UX_ps_open_user_currency_interval_period', { synchronize: false })
@Entity({ name: 'payment_statements' })
export class PaymentStatement extends BaseEntity {
  @Column({ type: 'varchar', nullable: true })
  userId: string;

  @Column({ type: 'varchar', default: PaymentStatementInterval.Monthly })
  interval: string;

  @Column({ type: 'varchar' })
  currency: string;

  @Column({ type: 'date' })
  periodStart: Date;

  @Column({ type: 'date' })
  periodEnd: Date;

  @Column({ type: 'varchar', nullable: true })
  invoiceId: string;

  @Column({ type: 'varchar', nullable: true })
  invoiceNumber: string;

  @Column({ type: 'varchar', nullable: true })
  invoiceUrl: string;

  @Column({ type: 'varchar', nullable: true })
  invoiceStatus: string;

  @Column({ type: 'varchar', nullable: true })
  invoicePdf: string;

  @Column({ type: 'nvarchar', length: 'max', default: null })
  failureReason: string;

  @Column({ type: 'varchar', default: PaymentStatementStatus.Open })
  status: string;

  @Column({ type: 'bigint', default: 0 })
  amountSubtotal: number;

  @Column({ type: 'bigint', default: 0 })
  amountDiscount: number;

  @Column({ type: 'bigint', default: 0 })
  amountTax: number;

  @Column({ type: 'bigint', default: 0 })
  amountTotal: number;

  @Column({ type: 'datetime', nullable: true })
  paidAt: Date;

  @Column({ type: 'int', default: 0 })
  attemptCount: number;

  @Column({ type: 'datetime', nullable: true })
  lastAttemptAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  nextAttemptAt: Date | null;

  @ManyToOne(() => User, (user) => user.paymentStatements, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => PaymentStatementItem, (item) => item.paymentStatement, {
    cascade: true,
  })
  items: PaymentStatementItem[];
}
