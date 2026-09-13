import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from 'src/auth/entities/auth.entity';
import { RescueRequest } from 'src/rescue-requests/entities/rescue-request.entity';
import { MissingPerson } from 'src/missing-persons/entities/missing-person.entity';
import { UsersModule } from 'src/users/users.module';
import { FilesModule } from 'src/files/files.module';
import { FieldReport } from './entities/field-report.entity';
import { OrganizationVolunteerRequest } from './entities/organization-volunteer-request.entity';
import { VolunteerOrganizationJoin } from './entities/volunteer-organization-join.entity';
import { VolunteerTask } from './entities/volunteer-task.entity';
import { VolunteerGroupJoin } from './entities/volunteer-group-join.entity';
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
      VolunteerGroupJoin,
      RescueRequest,
      MissingPerson,
      Auth,
    ]),
    UsersModule,
    FilesModule,
  ],
  controllers: [VolunteersController],
  providers: [VolunteersService],
  exports: [VolunteersService],
})
export class VolunteersModule {}

