/* eslint-disable prettier/prettier */
import { BaseEntity } from '../../common';
import { Column, Entity } from 'typeorm';

@Entity('tutorials')
export class Tutorials extends BaseEntity {
  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  category: string;

  @Column({ type: 'varchar', default: null })
  imageUrl: string;

  @Column({ type: 'varchar' })
  resourceType: string;

  @Column({ type: 'varchar', default: null })
  documentUrl: string;

  @Column({ type: 'varchar', default: null })
  pptUrl: string;

  @Column({ type: 'varchar', default: null })
  videoUrl: string;
}
