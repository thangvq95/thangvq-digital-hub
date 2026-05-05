import { NextRequest, NextResponse } from "next/server";

interface UpsertPayload {
  sync_type: "daily" | "weekly" | "monthly" | "full";
  repositories: {
    full_name: string;
    description: string;
    html_url: string;
    language?: string;
    avatar_url?: string;
    rank_daily?: number | null;
    rank_weekly?: number | null;
    rank_monthly?: number | null;
    stars_total?: number;
    stars_growth?: string;
    forks_total?: number;
    domains: string[];
  }[];
}

/**
 * POST /api/repos/upsert
 * Protected by x-api-key header.
 * Called exclusively by OpenClaw crawler.
 */
export async function POST(request: NextRequest) {
  // 1. Validate API key
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.SYNC_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: UpsertPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { sync_type, repositories } = body;

  if (!sync_type || !Array.isArray(repositories)) {
    return NextResponse.json(
      { error: "Missing sync_type or repositories" },
      { status: 400 }
    );
  }

  // TODO:
  // 2. Create sync_log entry (status: "running")
  // 3. Reset rank columns based on sync_type
  // 4. Upsert repositories (preserve is_favorite, is_applied, notes, first_seen_at)
  // 5. Update sync_log (status: "success", counts)

  return NextResponse.json(
    {
      message: "Upsert received",
      sync_type,
      received: repositories.length,
    },
    { status: 200 }
  );
}
