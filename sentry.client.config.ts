// sentry.client.config.ts
// This file configures the initialization of Sentry on the browser side.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NEXT_PUBLIC_ENV ?? 'development',

  // High sample rate since the project has low traffic (free tier is fine)
  tracesSampleRate: 1.0,

  // Capture 100% of replays for errors, 10% for general sessions
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
    Sentry.feedbackIntegration({
      colorScheme: 'dark',
    }),
  ],

  // Only send errors in production to avoid noise during dev
  enabled: process.env.NODE_ENV === 'production',

  // Ignore common non-actionable browser errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    /^Network Error/,
    /^ChunkLoadError/,
  ],
});
