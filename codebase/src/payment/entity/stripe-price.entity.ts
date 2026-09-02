import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index } from 'typeorm';

// Note: filtered unique index matches migration (isActive = 1 for MSSQL)
@Index('UQ_stripe_prices_active', ['kitType', 'paymentType', 'currency'], {
  unique: true,
  where: '"isActive" = 1',
})
@Index('IDX_stripe_prices_active', ['isActive'])
@Entity({ name: 'stripe_prices' })
export class StripePrice extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  kitType: string; // gut-scan | deep-gut | deep-gut-plus

  @Column({ type: 'varchar', length: 50 })
  paymentType: string; // PLATFORM_ORDER | WEBSITE_ORDER | KIT_REPLACEMENT_ORDER

  @Column({ type: 'varchar', length: 10 })
  currency: string; // USD | CAD

  @Column({ type: 'varchar', length: 255 })
  stripePriceId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  preOrderPriceId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripeProductId: string | null;

  @Column({ type: 'bigint' })
  amountMinor: number;

  @Column({ type: 'varchar', length: 20 })
  mode: string; // payment | subscription

  @Column({ type: 'varchar', length: 20, nullable: true })
  interval: string | null;

  @Column({ type: 'bit', default: () => '1' })
  isActive: boolean | number;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  description: string | null;
}
