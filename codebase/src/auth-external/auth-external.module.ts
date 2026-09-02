import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SentryInterceptor } from 'src/sentry/sentry.interceptor';
import { ApiKey } from 'src/user/entity/api-key.entity';
import { AuthExternalController } from './auth-external.controller';
import { AuthExternalService } from './auth-external.service';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKey])],
  controllers: [AuthExternalController],
  providers: [AuthExternalService, SentryInterceptor],
})
export class AuthExternalModule {}
