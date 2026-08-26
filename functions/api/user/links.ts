import { verifyJWT } from "../../lib/jwt";

function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(^| )${name}=([^;]+)`));
  if (match) return match[2];
  return null;
}

async function authenticate(context: any) {
  const { request, env } = context;
  const token = getCookie(request, "auth_token");
  if (!token) return null;
  const secret = env.JWT_SECRET || "default-secret-please-change";
  return await verifyJWT(token, secret);
}

export const onRequestGet = async (context: any) => {
  const user = await authenticate(context);
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { env } = context;
  const { results } = await env.DB.prepare("SELECT * FROM links WHERE user_id = ? ORDER BY created_at DESC").bind(user.sub).all();

  return new Response(JSON.stringify({ success: true, links: results }), { headers: { "Content-Type": "application/json" } });
};

export const onRequestPut = async (context: any) => {
  const user = await authenticate(context);
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { request, env } = context;
  const { code, original_url } = await request.json();

  if (!code || !original_url) return new Response("Missing code or original_url", { status: 400 });

  const result = await env.DB.prepare("UPDATE links SET original_url = ? WHERE code = ? AND user_id = ?").bind(original_url, code, user.sub).run();

  if (result.meta.changes === 0) {
    return new Response(JSON.stringify({ success: false, error: "Link not found or unauthorized" }), { status: 404 });
  }

  return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
};

export const onRequestDelete = async (context: any) => {
  const user = await authenticate(context);
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) return new Response("Missing code", { status: 400 });

  const result = await env.DB.prepare("DELETE FROM links WHERE code = ? AND user_id = ?").bind(code, user.sub).run();

  if (result.meta.changes === 0) {
    return new Response(JSON.stringify({ success: false, error: "Link not found or unauthorized" }), { status: 404 });
  }

  return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
};
