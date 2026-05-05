import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/repos
 * Query params: period, domain, fav, q (search)
 *
 * POST /api/repos (not used — upsert is at /api/repos/upsert)
 */

export async function GET(request: NextRequest) {
  // TODO: implement query with Supabase
  const { searchParams } = new URL(request.url);
  const _period = searchParams.get("period") ?? "daily";
  const _domain = searchParams.get("domain");
  const _fav = searchParams.get("fav") === "true";
  const _q = searchParams.get("q");

  // Placeholder response
  return NextResponse.json(
    { data: [], meta: { total: 0, period: _period } },
    { status: 200 }
  );
}
