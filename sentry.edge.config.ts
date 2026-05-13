// sentry.edge.config.ts
// This file configures the initialization of Sentry for edge features (middleware, etc.)
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NEXT_PUBLIC_ENV ?? 'development',

  tracesSampleRate: 1.0,

  enabled: process.env.NODE_ENV === 'production',
});
