import { authenticate } from "../../../lib/jwt";

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
  const statements: any[] = [];

  for (let i = 0; i < codes.length; i += chunkSize) {
    const chunk = codes.slice(i, i + chunkSize);
    const placeholders = chunk.map(() => '?').join(',');
    statements.push(env.DB.prepare(`DELETE FROM links WHERE code IN (${placeholders}) AND user_id = ?`).bind(...chunk, user.sub));
  }

  const results = await env.DB.batch(statements);
  const totalDeleted = results.reduce((sum: number, res: any) => sum + res.meta.changes, 0);

  if (totalDeleted === 0) {
    return new Response(JSON.stringify({ success: false, error: "Links not found or unauthorized" }), { status: 404 });
  }

  return new Response(JSON.stringify({ success: true, deleted: totalDeleted }), { headers: { "Content-Type": "application/json" } });
};
