export const onRequestPost = async () => {
  const cookie = `auth_token=; HttpOnly; Secure; Path=/; Max-Age=0; SameSite=Lax`;
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": cookie
    }
  });
};
