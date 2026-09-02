/* eslint-disable prettier/prettier */
import { KitStatus } from 'src/enum';
import { BaseEntity } from '../../common';
import { Column, Entity } from 'typeorm';

@Entity('valid-kit')
export class ValidKit extends BaseEntity {


  @Column({ type: 'varchar' })
  status: string;

  @Column({ type: 'varchar', default: null })
  expiryDate: string;

  @Column({ type: 'varchar', default: null })
  sampleType: string;

  @Column({ type: 'varchar', default: null })
  sequenceType: string;


  @Column({ type: 'varchar', unique: true })
  kitId: string;



}
