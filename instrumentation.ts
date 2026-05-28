// instrumentation.ts
// Next.js 14+ Instrumentation hook — loaded once at startup
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Capture unhandled errors from Next.js server actions / route handlers
export const onRequestError = async (
  err: unknown,
  request: Request,
  context: unknown,
) => {
  const { captureRequestError } = await import("@sentry/nextjs");
  const url = new URL(request.url);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  captureRequestError(
    err,
    {
      ...request,
      path: url.pathname,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
    } as any,
    context as any,
  );
  /* eslint-enable @typescript-eslint/no-explicit-any */
};
