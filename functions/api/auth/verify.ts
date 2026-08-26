export const onRequestGet = async (context: any) => {
  const { request, env } = context;

  if (!env.DB) {
    return new Response("Database not configured", { status: 500 });
  }

  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response("Missing verification token", { status: 400 });
  }

  try {
    const user = await env.DB
      .prepare("SELECT id, is_verified FROM users WHERE verification_token = ?")
      .bind(token)
      .first();

    if (!user) {
      return new Response("Invalid or expired verification token.", { status: 404 });
    }

    if (user.is_verified === 1) {
      return Response.redirect(`${env.BASE_URL || "https://urltrim.pages.dev"}/login?verified=already`, 302);
    }

    await env.DB
      .prepare("UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?")
      .bind(user.id)
      .run();

    return Response.redirect(`${env.BASE_URL || "https://urltrim.pages.dev"}/login?verified=true`, 302);
  } catch (error: any) {
    console.error("Verify error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
