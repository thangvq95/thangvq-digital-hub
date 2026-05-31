// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SentryModule } from '@sentry/nestjs/setup';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ReposModule } from './repos/repos.module';
import { SyncModule } from './sync/sync.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { LearningsModule } from './learnings/learnings.module';

@Module({
  imports: [
    // SentryModule must come first so lifecycle hooks are registered early
    SentryModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false,
      migrationsRun: process.env.TYPEORM_MIGRATIONS_RUN === 'true',
      migrations: [__dirname + '/migrations/*{.js,.ts}'],
      logging: process.env.NODE_ENV !== 'production',
    }),
    ServeStaticModule.forRoot({
      rootPath: process.env.UPLOADS_DIR || join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ReposModule,
    SyncModule,
    WebhooksModule,
    LearningsModule,
  ],
})
export class AppModule {}
