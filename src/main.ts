import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validateCustomDecorators: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // CORS configuration
  app.enableCors({
    origin: configService.get('app.corsOrigin'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-device-info'],
    credentials: true,
  });

  // Global prefix for all routes
  app.setGlobalPrefix(configService.get('app.globalPrefix') || 'api');

  const port = configService.get('app.port') || 3000;
  const globalPrefix = configService.get('app.globalPrefix') || 'api';

  await app.listen(port);

  logger.log(
    `Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
  logger.log(
    `Health check available at: http://localhost:${port}/${globalPrefix}/health`,
  );
  logger.log(`Environment: ${configService.get('app.environment')}`);
}

bootstrap().catch((error) => {
  console.error('Error starting application:', error);
  process.exit(1);
});
