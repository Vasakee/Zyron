import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { PaymentStatement } from './payment-statement.entity';
import { Order } from 'src/order/entity/order.entity';

@Entity({ name: 'payment_statement_items' })
export class PaymentStatementItem extends BaseEntity {
  @Column({ type: 'varchar' })
  paymentStatementId: string;

  @Column({ type: 'varchar' })
  orderId: string;

  @Column({ type: 'varchar' })
  currency: string;

  @Column({ type: 'bigint', default: 0 })
  unitAmount: number;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'bigint', default: 1 })
  quantity: number;

  @Column({ type: 'varchar', nullable: true })
  clientName: string;

  @Column({ type: 'varchar', nullable: true })
  clientEmail: string;

  @ManyToOne(() => PaymentStatement, (statement) => statement.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'paymentStatementId' })
  paymentStatement: PaymentStatement;

  @OneToOne(() => Order, (order) => order.paymentStatementItem)
  @JoinColumn({ name: 'orderId' })
  order: Order;
}
