import { PractitionerAccountStatus } from 'src/enum';
import { BaseEntity } from '../../common';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from 'src/user/entity/user.entity';

@Entity('admin')
export class Admin extends BaseEntity {
  @Column({ type: 'uuid', default: null })
  userId?: string;

  @Column({ type: 'simple-json' })
  permissions: string[];

  @OneToOne(() => User, (user) => user.admin)
  @JoinColumn({ name: 'userId' })
  user?: User;
}
