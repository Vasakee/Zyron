import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import {
  PORT,
  RUN_COMMAND,
  SENTRY_DSN,
  SWAGGER_PASS,
  SWAGGER_USER,
  origins,
} from './config';
import { SwaggerModule } from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger/dist';
import { AllExceptionsFilter } from './common';
import helmet from 'helmet';
import * as Sentry from '@sentry/node';
import { CommandFactory } from 'nest-commander';
import { AuthExternalModule } from './auth-external/auth-external.module';
import { swaggerAuth } from './common/middleware/swagger-auth.middleware';
import { OrderExternalModule } from './order-external/order-external.module';
import { DashboardService } from './dashboard/dashboard.service';

dotenv.config();

async function bootstrap() {
  if (RUN_COMMAND === 'true') {
    await CommandFactory.run(AppModule);
    process.exit(0);
  }

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.setGlobalPrefix('api/v1', {
    exclude: ['/v1/admin/queues'],
  });

  app.use(helmet());

  app.enableCors({ origin: origins, credentials: true });

  app.useGlobalFilters(new AllExceptionsFilter());

  const internalDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Vitract – Internal API')
      .setDescription('Full internal documentation for Vitract')
      .setVersion('1.0')
      .build(),
  );

  app.use('/docs', swaggerAuth(SWAGGER_USER, SWAGGER_PASS));

  SwaggerModule.setup('docs', app, internalDoc);

  const externalDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Vitract – External API')
      .setDescription('Public API for external consumers')
      .setVersion('1.0')
      .build(),
    {
      include: [AuthExternalModule, OrderExternalModule],
    },
  );

  SwaggerModule.setup('/api/docs/external', app, externalDoc);

  const dashboardService = app.get(DashboardService);
  app.use('/v1/admin/queues', dashboardService.getRouter());

  Sentry.init({
    dsn: SENTRY_DSN,
  });

  await app.listen(PORT, '0.0.0.0');

  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(
    `🚀 Bull Board is available at: ${await app.getUrl()}/v1/admin/queues`,
  );
  console.log(`🔌 WebSocket server is ready for connections`);
}
bootstrap();
