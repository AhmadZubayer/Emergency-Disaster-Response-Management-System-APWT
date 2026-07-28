import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from 'src/auth/entities/auth.entity';
import { Users } from 'src/users/entities/users.entity';
import { Volunteer } from 'src/volunteers/entities/volunteer.entity';
import { ReliefOrg } from 'src/relief-org/entities/relief-org.entity';
import { Disaster } from 'src/disaster/entities/disaster.entity';
import { RescueRequest } from 'src/rescue-requests/entities/rescue-request.entity';
import { CommunityPost } from 'src/community-posts/entities/community-post.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Auth,
      Users,
      Volunteer,
      ReliefOrg,
      Disaster,
      RescueRequest,
      CommunityPost,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
