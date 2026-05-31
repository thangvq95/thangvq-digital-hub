import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3005",
      },
      {
        protocol: "https",
        hostname: "thangvq95.page",
      },
      {
        protocol: "https",
        hostname: "www.thangvq95.page",
      },
    ],
  },
  turbopack: {
    root: __dirname,
  },
};

export default withSentryConfig(nextConfig, {
  // Sentry organization + project from sentry.io dashboard
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Auth token for source map uploads (set in CI / Vercel env vars)
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Suppress verbose Sentry CLI output during builds
  silent: !process.env.CI,

  // Upload source maps — remove after confirming stack traces work
  widenClientFileUpload: true,
});
