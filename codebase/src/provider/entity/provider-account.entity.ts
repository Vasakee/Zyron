import { BaseEntity } from 'src/common';
import { AccountStatus } from 'src/enum';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Provider } from './provider.entity';
import { User } from 'src/user/entity/user.entity';

@Index(['providerId', 'userId'], { unique: true })
@Entity('provider_accounts')
export class ProviderAccount extends BaseEntity {
  @Column({ type: 'uuid' })
  providerId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', default: AccountStatus.ACTIVE })
  status: string;

  @ManyToOne(() => Provider, (provider) => provider.accounts)
  @JoinColumn({ name: 'providerId' })
  provider?: Provider;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user?: User;
}
