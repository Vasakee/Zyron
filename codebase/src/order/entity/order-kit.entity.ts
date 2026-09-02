import { BaseEntity } from '../../common';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { OrderRegistrationStatus } from 'src/enum';

@Entity('order-kits')
export class OrderKit extends BaseEntity {
  @Column({ type: 'uuid' })
  orderId?: string;

  @Column({ type: 'varchar' })
  kitId: string;

  @Column({
    type: 'varchar',
    default: OrderRegistrationStatus.NO,
  })
  registrationStatus?: string;

  @Column({ type: 'varchar', nullable: true })
  registeredBy?: string;

  @Column({ type: 'uuid', nullable: true })
  registeredByUserId?: string;

  @ManyToOne(() => Order, (order) => order.orderKits, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderId' })
  order?: Order;
}
