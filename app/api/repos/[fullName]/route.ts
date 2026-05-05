import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/repos/[fullName]
 * Toggles is_favorite, is_applied, or updates notes for a repository.
 * fullName is URL-encoded "owner%2Frepo"
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ fullName: string }> }
) {
  const { fullName } = await params;
  const decodedFullName = decodeURIComponent(fullName);

  let body: { is_favorite?: boolean; is_applied?: boolean; notes?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // TODO: implement Supabase PATCH using decodedFullName
  console.log("PATCH repo:", decodedFullName, body);

  return NextResponse.json(
    { message: "Updated", full_name: decodedFullName },
    { status: 200 }
  );
}
