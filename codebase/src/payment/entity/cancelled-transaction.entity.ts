import { BaseEntity } from '../../common/entity/base.entity';
import {
  Entity,
  Column,
} from 'typeorm';

@Entity({ name: 'cancelled-transactions' })
export class CancelledTransaction extends BaseEntity {
  @Column({ type: 'varchar', unique: true})
  paymentIntentId: string;

  @Column({type: 'varchar'})
  email: string;
}