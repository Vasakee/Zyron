import { PractitionerAccountStatus } from 'src/enum';
import { BaseEntity } from '../../common';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from 'src/user/entity/user.entity';

@Entity('external_practitioner')
export class ExternalPractitioner extends BaseEntity {
  @Column({ type: 'uuid', default: null })
  userId: string;

  @Column({ type: 'varchar', default: null })
  lastName: string;

  @Column({ type: 'varchar', default: null })
  email: string;

  @Column({ type: 'varchar', default: null })
  firstName: string;

  @Column({ type: 'varchar', default: null })
  websiteUrl: string;

  @Column({ type: 'varchar', default: null })
  phone: string;

  @OneToOne(() => User, (user) => user.clientExternalPractitioner, {
    onUpdate: 'CASCADE',
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: 'userId' })
  client: User;
}
