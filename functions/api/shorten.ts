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

    // Check Auth (optional)
    const user = await authenticate(context);
    const userId = user?.sub || null;

    const db = env.DB;
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
      await db.prepare(`
        INSERT INTO links (id, code, original_url, clicks, created_at, expires_at, is_active, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(id, code, originalUrl, 0, createdAt, expiresAt, 1, userId).run();
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
