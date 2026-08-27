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
  const id = url.searchParams.get("id");

  if (!id) return new Response("Missing id", { status: 400 });

  // Prevent self-deletion
  if (id === admin.sub) {
    return new Response(JSON.stringify({ success: false, error: "Cannot delete yourself" }), { status: 400 });
  }

  // Delete all links owned by this user
  await env.DB.prepare("DELETE FROM links WHERE user_id = ?").bind(id).run();
  
  // Delete user
  const result = await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(id).run();

  if (result.meta.changes === 0) {
    return new Response(JSON.stringify({ success: false, error: "User not found" }), { status: 404 });
  }

  return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
};
