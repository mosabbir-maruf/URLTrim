import { authenticateAdmin } from "../../../lib/jwt";

export const onRequestGet = async (context: any) => {
  const admin = await authenticateAdmin(context);
  if (!admin) return new Response("Unauthorized", { status: 401 });

  const { env } = context;
  const { results } = await env.DB.prepare("SELECT id, email, role, created_at FROM users ORDER BY created_at DESC").all();

  return new Response(JSON.stringify({ success: true, users: results }), { headers: { "Content-Type": "application/json" } });
};

export const onRequestDelete = async (context: any) => {
  const admin = await authenticateAdmin(context);
  if (!admin) return new Response("Unauthorized", { status: 401 });

  const { request, env } = context;
  
  let ids: string[] = [];
  try {
    const body = await request.json();
    ids = body.ids || [];
  } catch (e) {
    // Fallback to query params
    const url = new URL(request.url);
    const idParam = url.searchParams.get("id");
    if (idParam) ids = [idParam];
  }

  if (!ids || ids.length === 0) return new Response("Missing id", { status: 400 });

  // Prevent self-deletion by filtering out admin's own ID
  const validIds = ids.filter(id => id !== admin.sub);
  
  if (validIds.length === 0) {
    return new Response(JSON.stringify({ success: false, error: "Cannot delete yourself" }), { status: 400 });
  }

  // Chunking to prevent SQLite max variable limits (usually 999)
  const chunkSize = 100;
  const statements: any[] = [];

  for (let i = 0; i < validIds.length; i += chunkSize) {
    const chunk = validIds.slice(i, i + chunkSize);
    const placeholders = chunk.map(() => '?').join(',');

    // Delete all links owned by these users
    statements.push(
      env.DB.prepare(`DELETE FROM links WHERE user_id IN (${placeholders})`).bind(...chunk)
    );
    // Delete users
    statements.push(
      env.DB.prepare(`DELETE FROM users WHERE id IN (${placeholders})`).bind(...chunk)
    );
  }

  const results = await env.DB.batch(statements);
  
  // The results array matches the statements array. Every odd index is the DELETE FROM users query result.
  let totalDeleted = 0;
  for (let i = 1; i < results.length; i += 2) {
    totalDeleted += results[i].meta.changes;
  }

  if (totalDeleted === 0) {
    return new Response(JSON.stringify({ success: false, error: "Users not found" }), { status: 404 });
  }

  return new Response(JSON.stringify({ success: true, deleted: totalDeleted }), { headers: { "Content-Type": "application/json" } });
};
