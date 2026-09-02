import { PractitionerAccountStatus } from 'src/enum';
import { BaseEntity } from '../../common';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import { ClientPractitioner } from './client-practitioner.entity';
import { PractitionerKit } from 'src/kit/entity/practitioner-kits.entity';

@Entity('practitioner')
export class Practitioner extends BaseEntity {
  @Column({ type: 'uuid', default: null })
  userId: string;

  @Column({ type: 'varchar', default: null })
  practiceName: string;

  @Column({ type: 'varchar', default: null })
  practiceUrl: string;

  @Column({ type: 'varchar', default: null })
  degree: string;

  @Column({ type: 'varchar', default: PractitionerAccountStatus.UnderReview })
  status: string;

  @Column({ type: 'varchar', default: null })
  gutTestUse: string;

  @Column({ type: 'varchar', default: null })
  gutTestUsedName: string;

  @Column({ type: 'varchar', default: null })
  practitionerType: string;

  @Column({ type: 'varchar', default: null })
  monthlyClients: string;

  @Column({ type: 'varchar', default: null })
  countryLocation: string;

  @Column({ type: 'varchar', default: null })
  stateLocation: string;

  @Column({ type: 'varchar', default: null })
  cityLocation: string;

  @Column({ type: 'varchar', default: null })
  zipCode: string;

  @OneToOne(() => User, (user) => user.practitioner, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(
    () => PractitionerKit,
    (practitionerKit) => practitionerKit.practitioner,
  )
  practitionerKit: PractitionerKit[];

  @OneToMany(
    () => ClientPractitioner,
    (clientPractitioner) => clientPractitioner.practitioner,
  )
  clientPractitioners: ClientPractitioner[];
}