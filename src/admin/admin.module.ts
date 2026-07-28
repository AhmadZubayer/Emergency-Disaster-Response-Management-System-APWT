import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Auth } from 'src/auth/entities/auth.entity';
import { Users } from 'src/users/entities/users.entity';
import { Volunteer } from 'src/volunteers/entities/volunteer.entity';
import { ReliefOrg } from 'src/relief-org/entities/relief-org.entity';
import { Disaster } from 'src/disaster/entities/disaster.entity';
import { Shelter } from 'src/shelter/entities/shelter.entity';
import { RescueRequest } from 'src/rescue-requests/entities/rescue-request.entity';
import { MissingPerson } from 'src/missing-persons/entities/missing-person.entity';
import { DonationCampaign } from 'src/donations/entities/campaign.entity';
import { CommunityPost } from 'src/community-posts/entities/community-post.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Auth,
      Users,
      Volunteer,
      ReliefOrg,
      Disaster,
      Shelter,
      RescueRequest,
      MissingPerson,
      DonationCampaign,
      CommunityPost,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
