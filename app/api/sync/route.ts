import { NextResponse } from "next/server";

/**
 * GET /api/sync
 * Returns the latest sync_log entry from Supabase.
 */
export async function GET() {
  // TODO: query Supabase sync_logs ORDER BY started_at DESC LIMIT 1

  const placeholder = {
    id: null,
    sync_type: null,
    repos_scraped: 0,
    repos_new: 0,
    repos_classified: 0,
    status: "never_run",
    started_at: null,
    completed_at: null,
  };

  return NextResponse.json({ data: placeholder }, { status: 200 });
}
