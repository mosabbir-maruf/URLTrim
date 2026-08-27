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
  const url = new URL(request.url);
  const ids = url.searchParams.getAll("id");

  if (!ids || ids.length === 0) return new Response("Missing id", { status: 400 });

  // Prevent self-deletion by filtering out admin's own ID
  const validIds = ids.filter(id => id !== admin.sub);
  
  if (validIds.length === 0) {
    return new Response(JSON.stringify({ success: false, error: "Cannot delete yourself" }), { status: 400 });
  }

  const placeholders = validIds.map(() => '?').join(',');

  // Delete all links owned by these users
  await env.DB.prepare(`DELETE FROM links WHERE user_id IN (${placeholders})`).bind(...validIds).run();
  
  // Delete users
  const result = await env.DB.prepare(`DELETE FROM users WHERE id IN (${placeholders})`).bind(...validIds).run();

  if (result.meta.changes === 0) {
    return new Response(JSON.stringify({ success: false, error: "Users not found" }), { status: 404 });
  }

  return new Response(JSON.stringify({ success: true, deleted: result.meta.changes }), { headers: { "Content-Type": "application/json" } });
};
