import { hashPassword, signJWT } from "../../../lib/jwt";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const onRequestPost = async (context: any) => {
  try {
    const { request, env } = context;
    if (!env.DB) return new Response("DB missing", { status: 500 });
    
    const secret = env.JWT_SECRET || "default-secret-please-change";
    const salt = env.PASSWORD_SALT || "default-salt-please-change";

    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return new Response(JSON.stringify({ success: false, error: "Invalid input" }), { status: 400 });
    }

    const { email, password } = result.data;
    
    const user = await env.DB.prepare("SELECT id, email, password_hash, role, is_verified FROM users WHERE email = ?").bind(email).first();
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: "Invalid email or password" }), { status: 401 });
    }

    const hashedPassword = await hashPassword(password, salt);
    if (hashedPassword !== user.password_hash) {
      return new Response(JSON.stringify({ success: false, error: "Invalid email or password" }), { status: 401 });
    }

    // Block unverified users
    if (user.is_verified === 0) {
      return new Response(JSON.stringify({ success: false, error: "Please verify your email before logging in. Check your inbox." }), { status: 403 });
    }

    // Sign JWT
    const token = await signJWT({ sub: user.id, email: user.email, role: user.role }, secret, 7);

    // Set cookie
    const cookie = `auth_token=${token}; HttpOnly; Secure; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`;

    return new Response(JSON.stringify({ success: true, role: user.role }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": cookie
      }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
};
