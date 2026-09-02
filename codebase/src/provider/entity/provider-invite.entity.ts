import { BaseEntity } from 'src/common';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Provider } from './provider.entity';

@Index(['providerId', 'email'])
@Entity('provider_invites')
export class ProviderInvite extends BaseEntity {
  @Column({ type: 'uuid' })
  providerId: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar' })
  lastName: string;

  @Column({ type: 'varchar' })
  tokenHash: string;

  @Column({ type: 'datetime' })
  expiresAt: Date;

  @Column({ type: 'datetime', nullable: true })
  acceptedAt?: Date | null;

  @Column({ type: 'uuid', nullable: true })
  createdByUserId?: string | null;

  // B7: Idempotency - track when invite email was sent to prevent duplicates
  @Column({ type: 'datetime', nullable: true })
  emailSentAt?: Date | null;

  @ManyToOne(() => Provider, (provider) => provider.invites)
  @JoinColumn({ name: 'providerId' })
  provider?: Provider;
}
