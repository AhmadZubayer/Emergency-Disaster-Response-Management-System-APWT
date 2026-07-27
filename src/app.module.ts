import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { MailerModule } from './mailer/mailer.module';
import { RescueRequestsModule } from './rescue-requests/rescue-requests.module';
import { MissingPersonsModule } from './missing-persons/missing-persons.module';
import { CommunityPostsModule } from './community-posts/community-posts.module';
import { DonationsModule } from './donations/donations.module';
import { VolunteersModule } from './volunteers/volunteers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: databaseConfig,
    }),
    CommonModule,
    AuthModule,
    UsersModule,
    FilesModule,
    MailerModule,
    RescueRequestsModule,
    MissingPersonsModule,
    CommunityPostsModule,
    DonationsModule,
    VolunteersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
