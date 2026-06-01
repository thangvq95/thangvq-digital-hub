// backend/src/instrument.ts
// MUST be imported before any other module (see main.ts)
// https://docs.sentry.io/platforms/javascript/guides/nestjs/
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables from ../infra/.env if it exists
const infraEnvPath = path.resolve(process.cwd(), '../infra/.env');
if (fs.existsSync(infraEnvPath)) {
  dotenv.config({ path: infraEnvPath });
} else {
  dotenv.config();
}

// Dynamically construct DATABASE_URL for local development if not provided
if (!process.env.DATABASE_URL) {
  const dbUser = 'digitalhub';
  const dbPass = process.env.POSTGRES_PASSWORD || 'devpassword';
  const dbHost = 'localhost';
  const dbPort = '5435'; // exposed port in docker-compose.yml
  const dbName = 'digitalhub';
  process.env.DATABASE_URL = `postgres://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`;
}

import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN_BE,

  environment: process.env.NODE_ENV ?? 'development',

  // High sample rates — tiny project, free tier handles it fine
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,

  integrations: [
    nodeProfilingIntegration(),
    // Captures all unhandled promise rejections
    Sentry.extraErrorDataIntegration(),
  ],

  enabled: process.env.NODE_ENV === 'production',

  // Ignore expected operational errors (e.g. 404s)
  ignoreErrors: ['NotFoundException', 'UnauthorizedException'],
});
