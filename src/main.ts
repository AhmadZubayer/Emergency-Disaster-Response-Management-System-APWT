import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './config/swagger.config';
import { CustomLoggerService } from './common/logger/logger.service';

async function bootstrap() {
  const logger = new CustomLoggerService('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  setupSwagger(app);
  const dataSource = app.get(DataSource);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;

  if (dataSource.isInitialized) {
    logger.logStartup(`Connected to database: ${dataSource.options.database}`);
    logger.logStartup(`EDRMS Server Listening on Port: ${port}`);
    logger.logStartup(`Swagger UI available at: http://localhost:${port}/api/docs`);
  }
  await app.listen(port);
}
bootstrap();