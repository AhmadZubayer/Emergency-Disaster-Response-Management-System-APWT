import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditEntity } from 'src/common/entities/audit.entity';

export enum DisasterType {
  CYCLONE = 'cyclone',
  FLOOD = 'flood',
  FLASH_FLOOD = 'flash_flood',
  HEAVY_RAIN = 'heavy_rain',
  DROUGHT = 'drought',
  EARTHQUAKE = 'earthquake',
  LANDSLIDE = 'landslide',
  WILDFIRE = 'wildfire',
  TSUNAMI = 'tsunami',
  HEATWAVE = 'heatwave',
  COLD_WAVE = 'cold_wave',
  RIVER_EROSION = 'river_erosion',
  STORM_SURGE = 'storm_surge',
  TORNADO = 'tornado',
  AVALANCHE = 'avalanche',
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

  @Column({ type: 'varchar', default: DisasterType.FLOOD })
  type: string;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;
}
