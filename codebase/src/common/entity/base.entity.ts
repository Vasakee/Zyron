import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn({
    type: 'datetime',
    default: () => 'GETUTCDATE()',
  })
  createdAt?: Date;

  @UpdateDateColumn({
    type: 'datetime',
    default: () => 'GETUTCDATE()',
  })
  updatedAt?: Date;
}
