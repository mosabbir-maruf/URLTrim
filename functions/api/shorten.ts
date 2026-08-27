import { urlSchema } from "../../lib/validation";
import { generateShortCode, RESERVED_ROUTES, validateCustomCode } from "../../lib/short-code";
import { authenticate } from "../../lib/jwt";

export const onRequestPost = async (context: any) => {
  try {
    const { request, env } = context;
    const body = await request.json();
    const result = urlSchema.safeParse(body);

    if (!result.success) {
      return new Response(JSON.stringify({ success: false, error: result.error.issues[0]?.message ?? "Invalid URL provided." }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    if (!env.DB) {
      return new Response(JSON.stringify({ success: false, error: "Database not bound." }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    const db = env.DB;
    // Check Auth (optional)
    const user = await authenticate(context);
    const userId = user?.sub || null;
    
    // Better IP resolution with fallbacks for local dev
    const ipAddress = request.headers.get("CF-Connecting-IP") || 
                      request.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
                      request.headers.get("x-real-ip") || 
                      "127.0.0.1";

    // Rate Limiting
    const oneDayAgo = Math.floor(Date.now() / 1000) - (24 * 60 * 60);
    
    if (!userId) {
      // Guest Rate Limit (5 per day)
      // Check if ip_address column exists using a try-catch for backwards compatibility during migration deployment
      try {
        const result = await db.prepare("SELECT COUNT(*) as count FROM links WHERE ip_address = ? AND created_at > ?")
          .bind(ipAddress, oneDayAgo)
          .first();
        const count = (result?.count as number) || 0;
        if (count >= 5) {
          return new Response(JSON.stringify({ success: false, error: "You've reached the daily guest limit (5 links). Please log in or create a free account to continue shortening links." }), { status: 429, headers: { "Content-Type": "application/json" } });
        }
      } catch (e) {
        // If the column doesn't exist yet, we silently skip the guest rate limit until migration runs
      }
    } else if (user.role !== "admin") {
      // Logged-in User Rate Limit (50 per day)
      const result = await db.prepare("SELECT COUNT(*) as count FROM links WHERE user_id = ? AND created_at > ?")
        .bind(userId, oneDayAgo)
        .first();
      const count = (result?.count as number) || 0;
      if (count >= 50) {
        return new Response(JSON.stringify({ success: false, error: "You've reached the daily limit for your account (50 links). Please try again tomorrow." }), { status: 429, headers: { "Content-Type": "application/json" } });
      }
    }

    const originalUrl = result.data.url;

    // Resolve the short code: prefer a custom alias when provided, otherwise auto-generate.
    let code = "";
    let isCustom = false;

    const rawCustom = typeof body.customCode === "string" ? body.customCode.trim() : "";
    if (rawCustom) {
      const customError = validateCustomCode(rawCustom);
      if (customError) {
        return new Response(JSON.stringify({ success: false, error: customError }), { status: 400, headers: { "Content-Type": "application/json" } });
      }
      const existing = await db.prepare("SELECT code FROM links WHERE code = ?").bind(rawCustom).first();
      if (existing) {
        return new Response(
          JSON.stringify({ success: false, error: "This custom code is already taken. Please choose another." }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }
      code = rawCustom;
      isCustom = true;
    } else {
      let collision = true;
      let attempts = 0;
      const MAX_ATTEMPTS = 5;
      while (collision && attempts < MAX_ATTEMPTS) {
        const candidate = generateShortCode(6);
        attempts++;
        if (RESERVED_ROUTES.has(candidate.toLowerCase())) continue;
        const existing = await db.prepare("SELECT code FROM links WHERE code = ?").bind(candidate).first();
        if (!existing) {
          code = candidate;
          collision = false;
        }
      }
      if (collision) {
        return new Response(JSON.stringify({ success: false, error: "Failed to generate a unique code. Please try again." }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // @ts-ignore
    const id = crypto.randomUUID();
    const createdAt = Math.floor(Date.now() / 1000);
    let expiresAt = null;
    if (body.expiresInDays && typeof body.expiresInDays === "number") {
       expiresAt = createdAt + (body.expiresInDays * 24 * 60 * 60);
    }

    try {
      try {
        await db.prepare(`
          INSERT INTO links (id, code, original_url, clicks, created_at, expires_at, is_active, user_id, ip_address)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(id, code, originalUrl, 0, createdAt, expiresAt, 1, userId, ipAddress).run();
      } catch (e: any) {
        // Fallback if the ip_address column migration hasn't run yet
        if (e.message && e.message.includes("has no column named ip_address")) {
          await db.prepare(`
            INSERT INTO links (id, code, original_url, clicks, created_at, expires_at, is_active, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(id, code, originalUrl, 0, createdAt, expiresAt, 1, userId).run();
        } else {
          throw e;
        }
      }
    } catch (insertErr: any) {
      // Final guard against race conditions / duplicates (code column is UNIQUE).
      if (/unique constraint failed/i.test(insertErr?.message ?? "")) {
        const msg = isCustom
          ? "This custom code is already taken. Please choose another."
          : "Failed to generate a unique code. Please try again.";
        return new Response(JSON.stringify({ success: false, error: msg }), { status: isCustom ? 409 : 500, headers: { "Content-Type": "application/json" } });
      }
      throw insertErr;
    }

    let baseUrl = env.BASE_URL || "https://urltrim.pages.dev";
    // Strip trailing slash if present
    if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, -1);
    }
    const shortUrl = `${baseUrl}/${code}`;

    return new Response(JSON.stringify({ success: true, shortCode: code, shortUrl }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
