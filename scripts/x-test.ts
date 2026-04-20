/**
 * Non-destructive smoke test for the X API tweet pipeline.
 *
 * Loads the stored refresh token (Upstash Redis or local .tokens.json),
 * refreshes the access token, calls /2/users/me + /2/users/{id}/tweets,
 * and prints a summary — WITHOUT writing src/data/tweets.json.
 *
 * Run with: `bun run x-test`
 *
 * Required env (same as the build):
 *   X_CLIENT_ID, X_CLIENT_SECRET
 *   UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN  (optional — falls back to .tokens.json)
 */
import { getAccessToken, loadTokens } from "./x-tokens";

function check(label: string, ok: boolean, detail?: string) {
  const icon = ok ? "✅" : "❌";
  console.log(`${icon} ${label}${detail ? `  ${detail}` : ""}`);
  if (!ok) process.exitCode = 1;
}

console.log("X API smoke test\n----------------");

const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;
console.log(
  `Token store: ${hasUpstash ? "Upstash Redis (key x:tokens)" : "local .tokens.json"}`,
);

const stored = await loadTokens();
check("Loaded stored tokens", !!stored?.refresh_token,
  stored?.expires_at
    ? `(access token expires in ${Math.round((stored.expires_at - Date.now()) / 1000)}s)`
    : "");

if (!stored?.refresh_token) {
  console.error(
    "\nNo refresh token found. Run `bun run x-auth` once locally with the same env vars to bootstrap.",
  );
  process.exit(1);
}

let accessToken: string;
try {
  accessToken = await getAccessToken();
  check("Got valid access token (refreshed if needed)", true);
} catch (err) {
  check("Got valid access token", false, (err as Error).message);
  process.exit(1);
}

const headers = { Authorization: `Bearer ${accessToken}` };

const meRes = await fetch(
  "https://api.x.com/2/users/me?user.fields=profile_image_url,name,username",
  { headers },
);
const meBody = await meRes.json();
check(
  `GET /2/users/me → ${meRes.status}`,
  meRes.ok && !!meBody?.data?.id,
  meRes.ok ? `(@${meBody.data.username}, id=${meBody.data.id})` : JSON.stringify(meBody),
);

if (!meRes.ok || !meBody?.data?.id) process.exit(1);

const tweetsParams = new URLSearchParams({
  max_results: "50",
  "tweet.fields": "created_at,public_metrics,attachments,referenced_tweets",
  expansions: "attachments.media_keys",
  "media.fields": "url,type,width,height,preview_image_url",
  exclude: "replies,retweets",
});
const tweetsRes = await fetch(
  `https://api.x.com/2/users/${meBody.data.id}/tweets?${tweetsParams}`,
  { headers },
);
const tweetsBody = await tweetsRes.json();
check(
  `GET /2/users/${meBody.data.id}/tweets → ${tweetsRes.status}`,
  tweetsRes.ok && Array.isArray(tweetsBody?.data),
  tweetsRes.ok
    ? `(${tweetsBody?.data?.length ?? 0} tweet(s) returned)`
    : JSON.stringify(tweetsBody),
);

if (tweetsRes.ok && Array.isArray(tweetsBody?.data)) {
  const filtered = tweetsBody.data.filter(
    (t: { text: string; public_metrics?: { like_count?: number } }) =>
      !t.text.startsWith("@") && (t.public_metrics?.like_count || 0) >= 40,
  );
  console.log(
    `\nWould write ${filtered.length} tweet(s) to src/data/tweets.json (≥40 likes, no replies).`,
  );
  for (const t of filtered.slice(0, 5)) {
    console.log(
      `  • ${t.id}  ❤ ${t.public_metrics?.like_count ?? 0}  ${t.text.slice(0, 60).replace(/\n/g, " ")}…`,
    );
  }
}
