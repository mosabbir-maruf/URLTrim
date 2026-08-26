import { verifyJWT } from "../../lib/jwt";

function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(^| )${name}=([^;]+)`));
  if (match) return match[2];
  return null;
}

export const onRequestGet = async (context: any) => {
  const { request, env } = context;
  const token = getCookie(request, "auth_token");
  
  if (!token) {
    return new Response(JSON.stringify({ authenticated: false }), { status: 401 });
  }

  const secret = env.JWT_SECRET || "default-secret-please-change";
  const payload = await verifyJWT(token, secret);

  if (!payload) {
    return new Response(JSON.stringify({ authenticated: false }), { status: 401 });
  }

  return new Response(JSON.stringify({
    authenticated: true,
    user: { id: payload.sub, email: payload.email, role: payload.role }
  }), { status: 200, headers: { "Content-Type": "application/json" } });
};
