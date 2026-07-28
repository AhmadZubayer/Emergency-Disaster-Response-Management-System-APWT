import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditEntity } from 'src/common/entities/audit.entity';

export enum DisasterType {
  CYCLONE = 'cyclone',
  FLOOD = 'flood',
  TSUNAMI = 'tsunami',
  HEATWAVE = 'heatwave',
  WILDFIRE = 'wildfire',
}

@Entity('disasters')
export class Disaster extends AuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  disaster_name: string;

  @Column({ type: 'varchar' })
  impacted_location: string;

  @Column({ type: 'timestamp' })
  impact_time: Date;

  @Column({ type: 'enum', enum: DisasterType })
  type: DisasterType;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;
}
