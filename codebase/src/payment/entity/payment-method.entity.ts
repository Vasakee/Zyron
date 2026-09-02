import { BaseEntity } from '../../common/entity/base.entity';
import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { PaymentMethodType, PaymentType } from 'src/enum';

@Entity({ name: 'payment-methods' })
export class PaymentMethod extends BaseEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar' })
  providerId: string;

  @Column({
    type: 'bit',
    default: 0,
  })
  isDefault: boolean | number;

  @Column({ type: 'varchar' })
  provider: string;

  @Column({ type: 'nvarchar', length: 'max' })
  metadata: string;

  @Column({ type: 'varchar', default: PaymentMethodType.Card })
  type: string;

  @ManyToOne(() => User, (user) => user.paymentMethod, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
