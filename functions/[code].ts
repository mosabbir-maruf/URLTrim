export const onRequestGet = async (context: any) => {
  const { env, params } = context;
  const code = params.code;

  if (!env.DB) {
    return new Response("Database not configured", { status: 500 });
  }

  try {
    const link = await env.DB
      .prepare("SELECT original_url, is_active, expires_at FROM links WHERE code = ?")
      .bind(code)
      .first();

    if (!link) {
      // Return 404, fallback to Next.js by using context.next()
      return context.next();
    }

    if (link.is_active === 0) {
      return new Response("Link is disabled", { status: 410 });
    }

    if (link.expires_at !== null) {
      const now = Math.floor(Date.now() / 1000);
      if (now > link.expires_at) {
        return new Response("Link has expired", { status: 410 });
      }
    }

    context.waitUntil(
      env.DB.prepare("UPDATE links SET clicks = clicks + 1 WHERE code = ?").bind(code).run()
    );

    return Response.redirect(link.original_url, 302);
  } catch (error) {
    console.error("Redirect error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
