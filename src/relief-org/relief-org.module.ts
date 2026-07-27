import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReliefOrg } from './entities/relief-org.entity';
import { Donation } from './entities/donation.entity';
import { Shelter } from './entities/shelter.entity';

import { ReliefOrgService } from './relief-org.service';
import { ReliefOrgController } from './relief-org.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    // এখন আর User stub নেই — Users entity UsersModule-এ আছে
    TypeOrmModule.forFeature([ReliefOrg, Donation, Shelter]),

    // JwtGuard ও RolesGuard ব্যবহার করতে AuthModule import করতে হবে
    AuthModule,
  ],
  controllers: [ReliefOrgController],
  providers: [ReliefOrgService],
  exports: [ReliefOrgService],
})
export class ReliefOrgModule {}
