import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RescueRequest } from './entities/rescue-request.entity';
import { RescueRequestsService } from './rescue-requests.service';
import { RescueRequestsController } from './rescue-requests.controller';
import { FilesModule } from 'src/files/files.module';
import { TrashModule } from 'src/trash/trash.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RescueRequest]),
    FilesModule,
    TrashModule,
  ],
  controllers: [RescueRequestsController],
  providers: [RescueRequestsService],
  exports: [RescueRequestsService],
})
export class RescueRequestsModule {}
