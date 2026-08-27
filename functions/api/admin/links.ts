import { authenticateAdmin } from "../../../lib/jwt";

export const onRequestGet = async (context: any) => {
  const admin = await authenticateAdmin(context);
  if (!admin) return new Response("Unauthorized", { status: 401 });

  const { env, request } = context;
  const url = new URL(request.url);
  const userId = url.searchParams.get("user_id");

  let query: string;
  let bindings: string[];

  if (userId) {
    query = `
      SELECT links.*, users.email 
      FROM links 
      LEFT JOIN users ON links.user_id = users.id 
      WHERE links.user_id = ? 
      ORDER BY links.created_at DESC
    `;
    bindings = [userId];
  } else {
    query = `
      SELECT links.*, users.email 
      FROM links 
      LEFT JOIN users ON links.user_id = users.id 
      ORDER BY links.created_at DESC
    `;
    bindings = [];
  }

  const stmt = bindings.length
    ? env.DB.prepare(query).bind(...bindings)
    : env.DB.prepare(query);
  const { results } = await stmt.all();

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
  
  let codes: string[] = [];
  try {
    const body = await request.json();
    codes = body.codes || [];
  } catch (e) {
    // Fallback to query params
    const url = new URL(request.url);
    const codeParam = url.searchParams.get("code");
    if (codeParam) codes = [codeParam];
  }

  if (!codes || codes.length === 0) return new Response("Missing code", { status: 400 });

  const chunkSize = 100;
  let totalDeleted = 0;

  for (let i = 0; i < codes.length; i += chunkSize) {
    const chunk = codes.slice(i, i + chunkSize);
    const placeholders = chunk.map(() => '?').join(',');
    const result = await env.DB.prepare(`DELETE FROM links WHERE code IN (${placeholders})`).bind(...chunk).run();
    totalDeleted += result.meta.changes;
  }

  if (totalDeleted === 0) {
    return new Response(JSON.stringify({ success: false, error: "Links not found" }), { status: 404 });
  }

  return new Response(JSON.stringify({ success: true, deleted: totalDeleted }), { headers: { "Content-Type": "application/json" } });
};
