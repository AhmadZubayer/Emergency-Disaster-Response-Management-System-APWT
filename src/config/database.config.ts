import { ConfigService } from '@nestjs/config';

export const databaseConfig = (config: ConfigService) => ({
  type: 'postgres' as const,
  host: config.get<string>('DB_HOST'),
  port: Number(config.get<string>('DB_PORT')),
  username: config.get<string>('DB_USERNAME'),
  password: String(config.get<string>('DB_PASSWORD') ?? ''),
  database: config.get<string>('DB_NAME'),
  autoLoadEntities: true,
  synchronize: true,
});
