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
