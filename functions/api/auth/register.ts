import { hashPassword } from "../../../lib/jwt";
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
      return new Response(JSON.stringify({ success: false, error: result.error.issues[0].message }), { status: 400 });
    }

    const { email, password } = result.data;

    // Check if user exists
    const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (existing) {
      return new Response(JSON.stringify({ success: false, error: "Email already in use" }), { status: 400 });
    }

    // Determine role from env whitelist to prevent race conditions
    const adminEmails = (env.ADMIN_EMAILS || "").split(",").map((e: string) => e.trim().toLowerCase());
    const role = adminEmails.includes(email.toLowerCase()) ? "admin" : "user";

    // Hash password
    const hashedPassword = await hashPassword(password, salt);
    // @ts-ignore
    const id = crypto.randomUUID();
    // @ts-ignore
    const verifyToken = crypto.randomUUID();
    const createdAt = Math.floor(Date.now() / 1000);

    // Insert user. If Resend is not configured, auto-verify (skips email verification).
    const isVerified = resendApiKey ? 0 : 1;
    await env.DB.prepare(
      "INSERT INTO users (id, email, password_hash, role, created_at, is_verified, verification_token) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(id, email, hashedPassword, role, createdAt, isVerified, verifyToken).run();

    // Send verification email via Resend (if API key is present)
    const resendApiKey = env.RESEND_API_KEY;
    if (resendApiKey) {
      const baseUrl = env.BASE_URL || "https://shorturl.pages.dev";
      const verifyLink = `${baseUrl}/api/auth/verify?token=${verifyToken}`;
      
      const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Courier New',Courier,monospace;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;padding:0;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;">

        <!-- Navbar -->
        <tr><td style="padding:16px 24px;border-bottom:1px solid #e8e8e8;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:14px;font-weight:bold;letter-spacing:1px;color:#111111;font-family:'Courier New',Courier,monospace;">
                ⚡ ShortURL
              </td>
              <td align="right">
                <span style="font-family:'Courier New',Courier,monospace;font-size:9px;font-weight:bold;color:#888888;text-transform:uppercase;letter-spacing:2px;">Email Verification</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Hero Section -->
        <tr><td style="padding:48px 24px 32px;text-align:center;">
          <h1 style="margin:0;font-size:28px;font-weight:bold;color:#111111;font-family:'Courier New',Courier,monospace;letter-spacing:-1px;line-height:1.1;">
            VERIFY YOUR
            <br/>
            <span style="color:#b3b3b3;">EMAIL ADDRESS.</span>
          </h1>
          <p style="margin:16px 0 0;font-size:12px;line-height:1.8;color:#888888;font-family:'Courier New',Courier,monospace;">
            Confirm your email to activate your<br/>
            ShortURL account and start creating links.
          </p>
        </td></tr>

        <!-- CTA Button (boxy, no rounded corners) -->
        <tr><td align="center" style="padding:0 24px 40px;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr><td style="background-color:#111111;padding:14px 40px;font-family:'Courier New',Courier,monospace;">
              <a href="${verifyLink}" target="_blank" style="color:#ffffff;font-size:10px;font-weight:bold;text-decoration:none;letter-spacing:3px;text-transform:uppercase;font-family:'Courier New',Courier,monospace;">VERIFY EMAIL &rarr;</a>
            </td></tr>
          </table>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding:0 24px;">
          <div style="border-top:1px solid #e8e8e8;"></div>
        </td></tr>

        <!-- Feature-style info blocks (matching the 001/002/003 pattern) -->
        <tr><td style="padding:0 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="50%" style="padding:24px 16px 24px 0;border-right:1px solid #e8e8e8;vertical-align:top;">
                <p style="margin:0 0 12px;font-family:'Courier New',Courier,monospace;font-size:9px;letter-spacing:3px;color:#bbbbbb;">001</p>
                <p style="margin:0 0 4px;font-family:'Courier New',Courier,monospace;font-size:12px;font-weight:bold;color:#111111;text-transform:uppercase;">What</p>
                <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:10px;color:#888888;line-height:1.6;">Verify your email to unlock your dashboard.</p>
              </td>
              <td width="50%" style="padding:24px 0 24px 16px;vertical-align:top;">
                <p style="margin:0 0 12px;font-family:'Courier New',Courier,monospace;font-size:9px;letter-spacing:3px;color:#bbbbbb;">002</p>
                <p style="margin:0 0 4px;font-family:'Courier New',Courier,monospace;font-size:12px;font-weight:bold;color:#111111;text-transform:uppercase;">Why</p>
                <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:10px;color:#888888;line-height:1.6;">Keeps your account secure and prevents spam.</p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding:0 24px;">
          <div style="border-top:1px solid #e8e8e8;"></div>
        </td></tr>

        <!-- Fallback link box -->
        <tr><td style="padding:24px;">
          <p style="margin:0 0 8px;font-family:'Courier New',Courier,monospace;font-size:9px;font-weight:bold;color:#bbbbbb;text-transform:uppercase;letter-spacing:2px;">Manual Link</p>
          <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:10px;line-height:1.5;color:#111111;word-break:break-all;background-color:#fafafa;padding:14px 16px;border:1px solid #e8e8e8;">
            ${verifyLink}
          </p>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding:0 24px;">
          <div style="border-top:1px solid #e8e8e8;"></div>
        </td></tr>

        <!-- Disclaimer -->
        <tr><td style="padding:20px 24px;">
          <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:9px;line-height:1.7;color:#bbbbbb;">
            If you didn't create a ShortURL account, you can safely ignore this email. This verification link is single-use and will expire automatically.
          </p>
        </td></tr>

        <!-- Footer (matching site footer style) -->
        <tr><td style="padding:16px 24px;border-top:1px solid #e8e8e8;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-family:'Courier New',Courier,monospace;font-size:9px;color:#bbbbbb;text-transform:uppercase;letter-spacing:2px;">
                A sideproject by <span style="color:#111111;font-weight:bold;">Mosabbir Maruf</span>
              </td>
              <td align="right" style="font-family:'Courier New',Courier,monospace;font-size:9px;color:#bbbbbb;text-transform:uppercase;letter-spacing:2px;">
                Edge &bull; D1 &bull; JWT
              </td>
            </tr>
          </table>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

      context.waitUntil(
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: env.RESEND_FROM_EMAIL || 'ShortURL <noreply@yourdomain.com>',
            to: email,
            subject: 'Verify your ShortURL account',
            html: emailHtml
          })
        }).then(res => res.json()).catch(err => console.error("Resend Error:", err))
      );
    } else {
      console.warn("RESEND_API_KEY is not set. Email not sent.");
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: resendApiKey
        ? "Registered successfully! Please check your email to verify your account."
        : "Registered successfully! Email verification is disabled, you can log in right away." 
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
};
