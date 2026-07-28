import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from 'src/users/entities/users.entity';
import { AuditEntity } from 'src/common/entities/audit.entity';
import { Shelter } from 'src/shelter/entities/shelter.entity';

@Entity('relief_orgs')
export class ReliefOrg extends AuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  user_id: string;

  @OneToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @Column({ type: 'varchar' })
  organization_name: string;

  @Column({ type: 'varchar', unique: true })
  registration_number: string;

  @Column({ type: 'varchar' })
  address: string;

  @Column({ type: 'varchar', nullable: true })
  website: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', nullable: true })
  organization_type: string | null;

  @Column({ type: 'varchar' })
  verification_doc: string;

  @Column({ type: 'boolean', default: false })
  admin_verified: boolean;

  @OneToMany(() => Shelter, (shelter) => shelter.relief_org)
  shelters: Shelter[];
}
