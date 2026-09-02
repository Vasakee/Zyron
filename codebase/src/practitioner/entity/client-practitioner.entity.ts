import { PractitionerAccessStatus } from 'src/enum';
import { BaseEntity } from '../../common';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import { Practitioner } from './practitioner.entity';

@Entity('client_practitioner')
export class ClientPractitioner extends BaseEntity {
  @Column({ type: 'uuid', default: null })
  userId: string;

  @Column({ type: 'varchar', default: null })
  practitionerId: string;

  @Column({ type: 'varchar', default: PractitionerAccessStatus.DECLINED })
  reportAccess: string;

  @ManyToOne(() => User, (user) => user.clientPractitioners, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(
    () => Practitioner,
    (practitioner) => practitioner.clientPractitioners,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'practitionerId' })
  practitioner: Practitioner;
}
