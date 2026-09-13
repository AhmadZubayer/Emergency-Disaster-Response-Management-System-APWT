import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonationsService } from './donations.service';
import { DonationsController } from './donations.controller';
import {
  DonationApplication,
  DonationCampaign,
  DonationTransaction,
} from './entities';
import { MailerModule } from 'src/mailer/mailer.module';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DonationCampaign,
      DonationTransaction,
      DonationApplication,
    ]),
    MailerModule,
    FilesModule,
  ],
  controllers: [DonationsController],
  providers: [DonationsService],
  exports: [DonationsService],
})
export class DonationsModule {}
