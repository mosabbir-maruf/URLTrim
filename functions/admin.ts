export const onRequestGet = async (context: any) => {
  const url = new URL(context.request.url);
  url.pathname = "/dashboard";
  return Response.redirect(url.toString(), 302);
};
