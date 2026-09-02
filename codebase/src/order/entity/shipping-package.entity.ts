import { Order } from 'src/order/entity/order.entity';
import { BaseEntity } from '../../common';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity('extra_shipping_packages')
export class ExtraShippingPackage extends BaseEntity {
  @Column({ type: 'varchar', nullable: true })
  trackingNumber?: string;

  @Column({ type: 'varchar', nullable: true })
  trackingUrl?: string;

  @ManyToOne(() => Order, (order) => order.extraPackages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderId' })
  order?: Order;

  @Column({ type: 'bigint', default: 1 }) quantity: number;

  @Column({ type: 'uuid' })
  orderId: string;
}
