import { BaseEntity } from 'src/common';
import { Provider } from 'src/provider/entity/provider.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'api-keys', synchronize: true })
export class ApiKey extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  clientId: string;

  @Column({ type: 'varchar', nullable: true })
  clientSecret: string;

  @Column({ type: 'varchar', nullable: true })
  username: string;

  @Column({ type: 'varchar', default: null })
  clientSecretHash: string;

  @Column({ type: 'uuid', nullable: true })
  providerId: string;

  @Column({ type: 'datetime', default: null })
  revokedAt?: Date;

  @Column({ type: 'datetime', default: null })
  lastRotatedAt?: Date;

  @Column({ type: 'uuid', default: null })
  createdByUserId?: string;

  @ManyToOne(() => Provider, (provider) => provider.apiKeys)
  @JoinColumn({ name: 'providerId' })
  provider?: Provider;
}
