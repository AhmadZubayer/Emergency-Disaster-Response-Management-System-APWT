import { Column } from 'typeorm';

export class Address {
  @Column({ type: 'varchar', nullable: true })
  house: string;

  @Column({ type: 'varchar', nullable: true })
  city: string;

  @Column({ type: 'varchar', nullable: true })
  district: string;

  @Column({ type: 'varchar', nullable: true, default: 'Bangladesh' })
  country: string;
}
