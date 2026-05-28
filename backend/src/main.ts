// backend/src/main.ts
// ⚠️  instrument.ts MUST be the very first import — Sentry patches Node.js internals
import './instrument';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SentryGlobalFilter } from '@sentry/nestjs/setup';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3002',
      'https://thangvq95.page',
      'https://www.thangvq95.page',
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Sentry global exception filter — reports unhandled exceptions to Sentry
  // app.useGlobalFilters(new SentryGlobalFilter());

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`API running on port ${port}`);
}
bootstrap();
