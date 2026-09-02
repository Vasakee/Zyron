import { BaseEntity } from 'src/common';
import { Column, Entity } from 'typeorm';

@Entity('generated-kits')
export class GeneratedKit extends BaseEntity {
  @Column({ type: 'varchar' })
  kitId: string;

  @Column({ type: 'text' })
  qrCode: string;

  @Column({ type: 'text', nullable: true })
  barCode: string;
}
