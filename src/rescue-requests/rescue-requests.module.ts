import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RescueRequest } from './entities/rescue-request.entity';
import { RescueRequestsService } from './rescue-requests.service';
import { RescueRequestsController } from './rescue-requests.controller';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [TypeOrmModule.forFeature([RescueRequest]), FilesModule],
  controllers: [RescueRequestsController],
  providers: [RescueRequestsService],
  exports: [RescueRequestsService],
})
export class RescueRequestsModule {}
