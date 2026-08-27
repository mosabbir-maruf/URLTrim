import { verifyJWT } from "../../../lib/jwt";

function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(^| )${name}=([^;]+)`));
  if (match) return match[2];
  return null;
}

async function authenticateAdmin(context: any) {
  const { request, env } = context;
  const token = getCookie(request, "auth_token");
  if (!token) return null;
  const secret = env.JWT_SECRET || "default-secret-please-change";
  const decoded = await verifyJWT(token, secret);
  if (!decoded || !decoded.sub) return null;
  
  // Real-time role verification from DB for strict security
  const user = await env.DB.prepare("SELECT role FROM users WHERE id = ?").bind(decoded.sub).first();
  if (!user || user.role !== "admin") return null;
  
  return decoded; // Return JWT payload (which includes sub)
}

export const onRequestGet = async (context: any) => {
  const admin = await authenticateAdmin(context);
  if (!admin) return new Response("Unauthorized", { status: 401 });

  const { env, request } = context;
  const url = new URL(request.url);
  const userId = url.searchParams.get("user_id");

  const { results } = await env.DB.prepare(`
    SELECT links.*, users.email 
    FROM links 
    LEFT JOIN users ON links.user_id = users.id 
    WHERE links.user_id = ? 
    ORDER BY links.created_at DESC
  `).bind(userId || admin.sub).all();

  return new Response(JSON.stringify({ success: true, links: results }), { headers: { "Content-Type": "application/json" } });
};

export const onRequestPut = async (context: any) => {
  const admin = await authenticateAdmin(context);
  if (!admin) return new Response("Unauthorized", { status: 401 });

  const { request, env } = context;
  const { code, original_url } = await request.json();

  if (!code || !original_url) return new Response("Missing code or original_url", { status: 400 });

  const result = await env.DB.prepare("UPDATE links SET original_url = ? WHERE code = ?").bind(original_url, code).run();

  if (result.meta.changes === 0) {
    return new Response(JSON.stringify({ success: false, error: "Link not found" }), { status: 404 });
  }

  return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
};

export const onRequestDelete = async (context: any) => {
  const admin = await authenticateAdmin(context);
  if (!admin) return new Response("Unauthorized", { status: 401 });

  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) return new Response("Missing code", { status: 400 });

  const result = await env.DB.prepare("DELETE FROM links WHERE code = ?").bind(code).run();

  if (result.meta.changes === 0) {
    return new Response(JSON.stringify({ success: false, error: "Link not found" }), { status: 404 });
  }

  return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
};
