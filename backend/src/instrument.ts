// backend/src/instrument.ts
// MUST be imported before any other module (see main.ts)
// https://docs.sentry.io/platforms/javascript/guides/nestjs/
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
