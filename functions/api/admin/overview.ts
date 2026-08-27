import { authenticateAdmin } from "../../../lib/jwt";

export const onRequestGet = async (context: any) => {
  const admin = await authenticateAdmin(context);
  if (!admin) return new Response("Unauthorized", { status: 401 });

  const { env } = context;
  const adminId = admin.sub;

  const row = await env.DB.prepare(`
    SELECT
      COUNT(*) as totalLinks,
      COUNT(CASE WHEN user_id != ? THEN 1 END) as userLinks,
      COALESCE(SUM(CASE WHEN user_id != ? THEN clicks END), 0) as userClicks
    FROM links
  `).bind(adminId, adminId).first();

  return new Response(JSON.stringify({
    success: true,
    totalLinks: row?.totalLinks || 0,
    userLinks: row?.userLinks || 0,
    userClicks: row?.userClicks || 0,
  }), { headers: { "Content-Type": "application/json" } });
};
