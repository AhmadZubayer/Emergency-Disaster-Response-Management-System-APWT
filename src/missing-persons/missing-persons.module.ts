import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissingPerson } from './entities/missing-person.entity';
import { MissingPersonsService } from './missing-persons.service';
import { MissingPersonsController } from './missing-persons.controller';
import { FilesModule } from 'src/files/files.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MissingPerson]),
    FilesModule,
    UsersModule,
  ],
  controllers: [MissingPersonsController],
  providers: [MissingPersonsService],
  exports: [MissingPersonsService],
})
export class MissingPersonsModule {}
