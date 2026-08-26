import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export const runtime = "edge";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  try {
    const db = getDB();

    const link = await db
      .prepare("SELECT original_url, is_active, expires_at FROM links WHERE code = ?")
      .bind(code)
      .first<{ original_url: string; is_active: number; expires_at: number | null }>();

    if (!link) {
      return new Response("Not found", { status: 404 });
    }

    if (link.is_active === 0) {
      return new Response("Link is disabled", { status: 410 });
    }

    if (link.expires_at !== null) {
      const now = Math.floor(Date.now() / 1000);
      if (now > link.expires_at) {
        return new Response("Link has expired", { status: 410 });
      }
    }

    // Increment click counter in background using executionContext (if possible) or just await it
    // Note: D1 is fast enough, doing it synchronously here is fine for v1, but fire-and-forget is better.
    // However, edge runtime might kill the isolate if we don't await. Let's just await it.
    await db
      .prepare("UPDATE links SET clicks = clicks + 1 WHERE code = ?")
      .bind(code)
      .run();

    return NextResponse.redirect(link.original_url, 302);
  } catch (error) {
    console.error("Redirect error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
