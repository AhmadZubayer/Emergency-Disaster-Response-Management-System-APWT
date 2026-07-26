import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from 'src/auth/entities/auth.entity';
import { RescueRequest } from 'src/rescue-requests/entities/rescue-request.entity';
import { UsersModule } from 'src/users/users.module';
import { FieldReport } from './entities/field-report.entity';
import { OrganizationVolunteerRequest } from './entities/organization-volunteer-request.entity';
import { VolunteerOrganizationJoin } from './entities/volunteer-organization-join.entity';
import { VolunteerTask } from './entities/volunteer-task.entity';
import { Volunteer } from './entities/volunteer.entity';
import { VolunteersController } from './volunteers.controller';
import { VolunteersService } from './volunteers.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Volunteer,
      VolunteerTask,
      FieldReport,
      OrganizationVolunteerRequest,
      VolunteerOrganizationJoin,
      RescueRequest,
      Auth,
    ]),
    UsersModule,
  ],
  controllers: [VolunteersController],
  providers: [VolunteersService],
  exports: [VolunteersService],
})
export class VolunteersModule {}
