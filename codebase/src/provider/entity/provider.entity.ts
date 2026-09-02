import { BaseEntity } from 'src/common';
import { AccountStatus, KitType } from 'src/enum';
import { Column, Entity, OneToMany } from 'typeorm';
import { ProviderAccount } from './provider-account.entity';
import { ApiKey } from 'src/user/entity/api-key.entity';
import { ProviderInvite } from './provider-invite.entity';

@Entity('providers')
export class Provider extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'varchar', unique: true })
  clientId: string;

  @Column({ type: 'simple-array', nullable: true })
  kitTypes: KitType[];

  @Column({ type: 'varchar', default: AccountStatus.ACTIVE })
  status: string;

  @OneToMany(() => ProviderAccount, (account) => account.provider)
  accounts?: ProviderAccount[];

  @OneToMany(() => ApiKey, (apiKey) => apiKey.provider)
  apiKeys?: ApiKey[];

  @OneToMany(() => ProviderInvite, (invite) => invite.provider)
  invites?: ProviderInvite[];
}
