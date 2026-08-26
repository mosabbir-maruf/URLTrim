import { hashPassword } from "../../lib/jwt";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const onRequestPost = async (context: any) => {
  try {
    const { request, env } = context;
    if (!env.DB) return new Response("DB missing", { status: 500 });
    
    // Cloudflare requires JWT_SECRET in Dashboard
    const secret = env.JWT_SECRET || "default-secret-please-change";
    const salt = env.PASSWORD_SALT || "default-salt-please-change";

    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return new Response(JSON.stringify({ success: false, error: result.error.errors[0].message }), { status: 400 });
    }

    const { email, password } = result.data;

    // Check if user exists
    const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (existing) {
      return new Response(JSON.stringify({ success: false, error: "Email already in use" }), { status: 400 });
    }

    // Determine role (first user is admin, else user)
    const userCountResult = await env.DB.prepare("SELECT COUNT(*) as count FROM users").first();
    const isFirstUser = userCountResult && userCountResult.count === 0;
    const role = isFirstUser ? "admin" : "user";

    // Hash password
    const hashedPassword = await hashPassword(password, salt);
    // @ts-ignore
    const id = crypto.randomUUID();
    const createdAt = Math.floor(Date.now() / 1000);

    // Insert user
    await env.DB.prepare(
      "INSERT INTO users (id, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)"
    ).bind(id, email, hashedPassword, role, createdAt).run();

    return new Response(JSON.stringify({ success: true, message: "Registered successfully" }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
};
