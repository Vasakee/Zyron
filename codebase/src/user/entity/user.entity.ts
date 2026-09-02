import { BaseEntity } from 'src/common';
import { Kit } from '../../kit/entity/kit.entity';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { AccountStatus, PasswordUpdateStatus, Strategy } from 'src/enum';
import { Practitioner } from 'src/practitioner/entity/practitioner.entity';
import { Support } from 'src/support/entity/support.entity';
import { ExternalPractitioner } from 'src/practitioner/entity/external-practitioner.entity';
import { ClientPractitioner } from 'src/practitioner/entity/client-practitioner.entity';
import { FamilyKit } from 'src/kit/entity/family-kit.entity';
import { Admin } from 'src/admin/entity/admin.entity';
import { Transaction } from 'src/payment/entity/transaction.entity';
import { Order } from 'src/order/entity/order.entity';
import { PaymentMethod } from 'src/payment/entity/payment-method.entity';
import { SupportMessage } from 'src/support/entity/support-message.entity';
import { Transfer } from './transfer-log.entity';
import { CustomerProfile } from 'src/vaari/entity/customer-profile.entity';
import { PaymentStatement } from '../../payment/entity/payment-statement.entity';

@Entity('user')
export class User extends BaseEntity {
  @Column({ type: 'varchar', default: null })
  firstName: string;

  @Column({ type: 'varchar', default: null })
  lastName: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', default: null })
  phone: string;

  @Column({ type: 'varchar', default: null })
  password: string;

  @Column({ type: 'varchar', default: null })
  recommended: string;

  @Column({ type: 'varchar', default: null })
  awarenessChannel: string;

  @Column({
    type: 'bit',
    default: 0,
  })
  receiveMarketing: boolean | number;

  @Column({
    type: 'bit',
    default: 0,
  })
  monthlyBillingAccess: boolean | number;

  @Column({ type: 'varchar', default: 'user' })
  role: string;

  @Column({ default: Strategy.NORMAL })
  strategy: string;

  @Column({ type: 'varchar', default: null })
  avatar: string;

  @Column({ type: 'varchar', default: null })
  resetPasswordToken?: string;

  @Column({ type: 'bigint', default: null })
  resetPasswordExpire?: number;

  @Column({
    type: 'datetime',
    default: null,
  })
  emailVerifiedAt: Date;

  @Column({ type: 'varchar', default: PasswordUpdateStatus.Completed })
  passwordUpdateStatus: string;

  @Column({ type: 'varchar', default: null })
  stripeId: string;

  @Column({ type: 'varchar', default: AccountStatus.ACTIVE })
  status: string;

  @OneToMany(() => Kit, (kit) => kit.user)
  kit: Kit[];

  @OneToMany(() => FamilyKit, (familyKit) => familyKit.user)
  familyKit: FamilyKit[];

  @OneToOne(() => Practitioner, (practitioner) => practitioner.user, {
    cascade: true,
  })
  practitioner: Practitioner;

  @OneToOne(() => Admin, (admin) => admin.user, {
    cascade: true,
  })
  admin: Admin;

  @OneToMany(
    () => ClientPractitioner,
    (clientPractitioner) => clientPractitioner.user,
    {
      cascade: true,
    },
  )
  clientPractitioners: ClientPractitioner[];

  @OneToOne(() => ExternalPractitioner, (practitioner) => practitioner.client, {
    cascade: true,
  })
  clientExternalPractitioner: ExternalPractitioner;

  @OneToMany(() => Support, (support) => support.user)
  support: Support[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transaction: Transaction[];

  @OneToMany(() => PaymentStatement, (ps) => ps.user)
  paymentStatements: PaymentStatement[];

  @OneToMany(() => PaymentMethod, (paymentMethod) => paymentMethod.user)
  paymentMethod: PaymentMethod[];

  @OneToMany(() => Order, (order) => order.user)
  order: Order[];

  @OneToMany(() => CustomerProfile, (customerProfile) => customerProfile.user)
  customerProfiles: CustomerProfile[];

  @OneToMany(
    () => CustomerProfile,
    (customerProfile) => customerProfile.lastUpdatedBy,
  )
  customerProfileUpdatedBy: CustomerProfile[];

  @OneToMany(() => Support, (support) => support.assignedTo)
  supportAssignees: Support[];

  @OneToMany(() => SupportMessage, (supportMessage) => supportMessage.user)
  supportMessage: SupportMessage[];

  @OneToMany(() => Transfer, (transferLog) => transferLog.user)
  transferLogs: Transfer[];
}
