import { urlSchema } from "../../lib/validation";
import { generateShortCode, RESERVED_ROUTES } from "../../lib/short-code";
import { verifyJWT } from "../../lib/jwt";

function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(^| )${name}=([^;]+)`));
  if (match) return match[2];
  return null;
}

export const onRequestPost = async (context: any) => {
  try {
    const { request, env } = context;
    const body = await request.json();
    const result = urlSchema.safeParse(body);

    if (!result.success) {
      return new Response(JSON.stringify({ success: false, error: "Invalid URL provided." }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    if (!env.DB) {
      return new Response(JSON.stringify({ success: false, error: "Database not bound." }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    // Check Auth
    let userId = null;
    const token = getCookie(request, "auth_token");
    if (token) {
      const secret = env.JWT_SECRET || "default-secret-please-change";
      const payload = await verifyJWT(token, secret);
      if (payload && payload.sub) {
        userId = payload.sub;
      }
    }

    const db = env.DB;
    const originalUrl = result.data.url;
    let code = "";
    let collision = true;
    let attempts = 0;
    const MAX_ATTEMPTS = 5;

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
      return new Response(JSON.stringify({ success: false, error: "Failed to generate unique code." }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    // @ts-ignore
    const id = crypto.randomUUID();
    const createdAt = Math.floor(Date.now() / 1000);
    let expiresAt = null;
    if (body.expiresInDays && typeof body.expiresInDays === "number") {
       expiresAt = createdAt + (body.expiresInDays * 24 * 60 * 60);
    }

    await db.prepare(`
      INSERT INTO links (id, code, original_url, clicks, created_at, expires_at, is_active, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, code, originalUrl, 0, createdAt, expiresAt, 1, userId).run();

    let baseUrl = env.BASE_URL || "https://shorturl.pages.dev";
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
