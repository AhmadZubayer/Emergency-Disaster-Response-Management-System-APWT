import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { MailerModule } from './mailer/mailer.module';
import { ReliefOrgModule } from './relief-org/relief-org.module';
import { RescueRequestsModule } from './rescue-requests/rescue-requests.module';
import { MissingPersonsModule } from './missing-persons/missing-persons.module';
import { CommunityPostsModule } from './community-posts/community-posts.module';
import { DonationsModule } from './donations/donations.module';
import { DisasterModule } from './disaster/disaster.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: databaseConfig,
    }),
    AuthModule,
    UsersModule,
    FilesModule,
    MailerModule,
    ReliefOrgModule,
    RescueRequestsModule,
    MissingPersonsModule,
    CommunityPostsModule,
    DonationsModule,
    DisasterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
