import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const dataSource = app.get(DataSource);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT')!;

  if (dataSource.isInitialized) {
    console.log(`Connected to database: ${dataSource.options.database}`);
    console.log(`EDRMS Server Listening on Port: ${port}`);
  }
  await app.listen(port);
}
bootstrap();
