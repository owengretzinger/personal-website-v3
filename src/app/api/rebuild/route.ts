export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const res = await fetch(process.env.DEPLOY_HOOK_URL!, { method: "POST" });
  return new Response(null, { status: res.ok ? 204 : 502 });
}
