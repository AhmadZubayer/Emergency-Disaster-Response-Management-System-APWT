import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReliefOrg } from './entities/relief-org.entity';
import { ReliefOrgService } from './relief-org.service';
import { ReliefOrgController } from './relief-org.controller';
import { FilesModule } from 'src/files/files.module';
import { MailerModule } from 'src/mailer/mailer.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { DisasterModule } from 'src/disaster/disaster.module';
import { VolunteersModule } from 'src/volunteers/volunteers.module';
import { DonationsModule } from 'src/donations/donations.module';
import { Auth } from 'src/auth/entities/auth.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReliefOrg, Auth]),
    FilesModule,
    MailerModule,
    AuthModule,
    UsersModule,
    DisasterModule,
    VolunteersModule,
    DonationsModule,
  ],
  controllers: [ReliefOrgController],
  providers: [ReliefOrgService],
  exports: [ReliefOrgService],
})
export class ReliefOrgModule {}
