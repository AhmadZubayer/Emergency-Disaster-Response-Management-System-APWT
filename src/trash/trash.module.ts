import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrashItem } from './entities/trash-item.entity';
import { TrashService } from './trash.service';
import { TrashController } from './trash.controller';
import { MissingPerson } from 'src/missing-persons/entities/missing-person.entity';
import { RescueRequest } from 'src/rescue-requests/entities/rescue-request.entity';
import { CommunityPost } from 'src/community-posts/entities/community-post.entity';
import { FilesModule } from 'src/files/files.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrashItem,
      MissingPerson,
      RescueRequest,
      CommunityPost,
    ]),
    FilesModule,
    CommonModule,
  ],
  controllers: [TrashController],
  providers: [TrashService],
  exports: [TrashService],
})
export class TrashModule {}
