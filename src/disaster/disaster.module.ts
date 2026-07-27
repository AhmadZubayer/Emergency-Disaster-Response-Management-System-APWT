import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisasterService } from './disaster.service';
import { DisasterController } from './disaster.controller';
import { Disaster } from './entities/disaster.entity';
import { Auth } from 'src/auth/entities/auth.entity';
import { AuthModule } from 'src/auth/auth.module';
import { MailerModule } from 'src/mailer/mailer.module';

@Module({
  imports: [TypeOrmModule.forFeature([Disaster, Auth]), AuthModule, MailerModule],
  controllers: [DisasterController],
  providers: [DisasterService],
  exports: [DisasterService],
})
export class DisasterModule {}
