import { NextRequest, NextResponse } from "next/server";
import { getDB, getBaseUrl } from "@/lib/db";
import { urlSchema } from "@/lib/validation";
import { generateShortCode, RESERVED_ROUTES } from "@/lib/short-code";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = urlSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Invalid URL provided." },
        { status: 400 }
      );
    }

    const db = getDB();
    const originalUrl = result.data.url;
    let code = "";
    let collision = true;
    let attempts = 0;
    const MAX_ATTEMPTS = 5;

    // Generate a unique code
    while (collision && attempts < MAX_ATTEMPTS) {
      code = generateShortCode(6);
      if (RESERVED_ROUTES.has(code.toLowerCase())) {
        continue;
      }
      
      const existing = await db
        .prepare("SELECT code FROM links WHERE code = ?")
        .bind(code)
        .first();

      if (!existing) {
        collision = false;
      }
      attempts++;
    }

    if (collision) {
      return NextResponse.json(
        { success: false, error: "Failed to generate a unique short code. Please try again." },
        { status: 500 }
      );
    }

    const id = crypto.randomUUID();
    const createdAt = Math.floor(Date.now() / 1000);
    
    // Parse expiration (optional in body)
    let expiresAt: number | null = null;
    const requestBody = body as { expiresInDays?: number };
    if (requestBody.expiresInDays && typeof requestBody.expiresInDays === "number") {
       expiresAt = createdAt + (requestBody.expiresInDays * 24 * 60 * 60);
    }

    await db.prepare(`
      INSERT INTO links (id, code, original_url, clicks, created_at, expires_at, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(id, code, originalUrl, 0, createdAt, expiresAt, 1).run();

    const baseUrl = getBaseUrl();
    const shortUrl = `${baseUrl}/${code}`;

    return NextResponse.json({
      success: true,
      shortCode: code,
      shortUrl
    });

  } catch (error: any) {
    console.error("Error creating short link:", error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || "Internal server error." }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
}
