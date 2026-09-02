import { BaseEntity } from '../../common';
import { Column, Entity } from 'typeorm';

@Entity('contacts')
export class ContactMessage extends BaseEntity {
  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar' })
  lastName: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', nullable: true })
  fileUrl: string;

  get name(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
