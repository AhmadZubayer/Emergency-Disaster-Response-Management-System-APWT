import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shelter } from './entities/shelter.entity';
import { ShelterService } from './shelter.service';
import { ShelterController } from './shelter.controller';
import { ReliefOrg } from 'src/relief-org/entities/relief-org.entity';
import { Disaster } from 'src/disaster/entities/disaster.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shelter, ReliefOrg, Disaster])],
  controllers: [ShelterController],
  providers: [ShelterService],
  exports: [ShelterService],
})
export class ShelterModule {}
