import { authenticate } from "../../../lib/jwt";

export const onRequestGet = async (context: any) => {
  const user = await authenticate(context);
  
  if (!user) {
    return new Response(JSON.stringify({ authenticated: false }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  return new Response(JSON.stringify({
    authenticated: true,
    user: { id: user.sub, email: user.email, role: user.role }
  }), { status: 200, headers: { "Content-Type": "application/json" } });
};
