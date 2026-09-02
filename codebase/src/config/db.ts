import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import {
  NODE_ENV,
  DATABASE_NAME,
  DATABASE_HOST,
  DATABASE_PASSWORD,
  DATABASE_PORT,
  DATABASE_USER,
} from '.';
import * as dotenv from 'dotenv';

dotenv.config();

class DbConfig {
  public getTypeOrmConfig(): TypeOrmModuleOptions {
    const isProd = NODE_ENV === 'production';
    const port = Number(DATABASE_PORT) || 1433;

    return {
      type: 'mssql',
      host: DATABASE_HOST,
      username: DATABASE_USER,
      password: DATABASE_PASSWORD,
      database: DATABASE_NAME,
      synchronize: false,
      entities: ['dist/**/*.entity.js'],
      migrationsTableName: 'migration',
      migrations: ['dist/common/migrations/*.js'],
      options: {
        encrypt: true,
        trustServerCertificate: NODE_ENV !== 'production',
        enableArithAbort: true,
      },
      extra: {
        encrypt: true,
        trustServerCertificate: NODE_ENV !== 'production',
        enableArithAbort: true,
        connectTimeout: 60_000,
        requestTimeout: 60_000,
        pool: {
          max: 10,
          min: 0,
          idleTimeoutMillis: 30_000,
        },
      },
      retryAttempts: 5,
      retryDelay: 2000,
    };
  }
}

const dbconfig = new DbConfig();
export { dbconfig };
