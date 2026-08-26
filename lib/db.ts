import { getRequestContext } from "@cloudflare/next-on-pages";

export function getDB() {
  const ctx = getRequestContext();
  if (!ctx.env.DB) {
    throw new Error("D1 Database binding not found");
  }
  return ctx.env.DB;
}

export function getBaseUrl() {
  let url = process.env.BASE_URL;
  try {
    const ctx = getRequestContext();
    if (ctx.env.BASE_URL) url = ctx.env.BASE_URL;
  } catch {
    // Ignore error when not in Edge runtime
  }

  if (!url) {
    throw new Error("BASE_URL environment variable is not defined");
  }

  return url;
}
