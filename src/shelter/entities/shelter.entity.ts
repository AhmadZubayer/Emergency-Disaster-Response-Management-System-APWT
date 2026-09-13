import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditEntity } from 'src/common/entities/audit.entity';
import { ReliefOrg } from 'src/relief-org/entities/relief-org.entity';
import { Disaster } from 'src/disaster/entities/disaster.entity';

@Entity('shelters')
export class Shelter extends AuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  shelter_name: string;

  @Column({ type: 'varchar' })
  shelter_location: string;

  @Column({ type: 'int' })
  shelter_capacity: number;

  @Column({ type: 'int', default: 0 })
  current_people_count: number;

  @Column({ type: 'uuid' })
  disaster_id: string;

  @ManyToOne(() => Disaster, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'disaster_id' })
  disaster: Disaster;

  @Column({ type: 'uuid' })
  relief_org_id: string;

  @ManyToOne(() => ReliefOrg, (org) => org.shelters, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'relief_org_id' })
  relief_org: ReliefOrg;
}
