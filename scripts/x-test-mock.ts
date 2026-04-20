/**
 * Mocked end-to-end test for the X API tweet pipeline.
 *
 * Stubs `globalThis.fetch` and `@upstash/redis` so the full pipeline can be
 * exercised without real credentials. Verifies that:
 *   1. An expired access token triggers a refresh call.
 *   2. The refreshed token is persisted back to the token store.
 *   3. /users/me + /users/{id}/tweets are called with the correct headers.
 *   4. fetch-tweets.ts produces the expected tweets.json shape.
 *
 * Run with: `bun run scripts/x-test-mock.ts`
 */
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const tmp = mkdtempSync(join(tmpdir(), "x-test-"));
process.chdir(tmp);
import { mkdirSync, writeFileSync } from "node:fs";
mkdirSync("src/data", { recursive: true });
writeFileSync("src/data/tweets.json", "[]");

process.env.X_CLIENT_ID = "test-client-id";
process.env.X_CLIENT_SECRET = "test-client-secret";
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;

writeFileSync(
  ".tokens.json",
  JSON.stringify({
    access_token: "OLD_ACCESS",
    refresh_token: "REFRESH_v1",
    expires_at: Date.now() - 1000,
  }),
);

type Call = { url: string; init?: RequestInit };
const calls: Call[] = [];

const origFetch = globalThis.fetch;
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === "string" ? input : input.toString();
  calls.push({ url, init });

  if (url === "https://api.x.com/2/oauth2/token") {
    const body = init?.body?.toString() ?? "";
    if (!body.includes("grant_type=refresh_token")) throw new Error("bad token body");
    if (!body.includes("refresh_token=REFRESH_v1")) throw new Error("wrong refresh token");
    return new Response(
      JSON.stringify({
        access_token: "NEW_ACCESS",
        refresh_token: "REFRESH_v2",
        expires_in: 7200,
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }

  if (url.startsWith("https://api.x.com/2/users/me")) {
    const auth = (init?.headers as Record<string, string>)?.Authorization;
    if (auth !== "Bearer NEW_ACCESS") throw new Error(`wrong auth header: ${auth}`);
    return new Response(
      JSON.stringify({
        data: {
          id: "12345",
          name: "Test User",
          username: "owengretzinger",
          profile_image_url: "https://pbs.twimg.com/profile_images/test_normal.jpg",
        },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }

  if (url.startsWith("https://api.x.com/2/users/12345/tweets")) {
    const auth = (init?.headers as Record<string, string>)?.Authorization;
    if (auth !== "Bearer NEW_ACCESS") throw new Error(`wrong auth header: ${auth}`);
    return new Response(
      JSON.stringify({
        data: [
          {
            id: "tweet-1",
            text: "Hello world https://t.co/foo",
            created_at: "2026-04-19T12:00:00Z",
            public_metrics: { like_count: 100, retweet_count: 5, reply_count: 2 },
            attachments: { media_keys: ["m1"] },
          },
          {
            id: "tweet-2",
            text: "Low-likes tweet, should be filtered",
            created_at: "2026-04-18T12:00:00Z",
            public_metrics: { like_count: 3 },
          },
          {
            id: "tweet-3",
            text: "@someone reply, should be filtered",
            created_at: "2026-04-17T12:00:00Z",
            public_metrics: { like_count: 999 },
          },
          {
            id: "tweet-4",
            text: "Another solid tweet",
            created_at: "2026-04-16T12:00:00Z",
            public_metrics: { like_count: 75, retweet_count: 0, reply_count: 0 },
          },
        ],
        includes: {
          media: [
            {
              media_key: "m1",
              type: "photo",
              url: "https://pbs.twimg.com/media/test.jpg",
              width: 1200,
              height: 800,
            },
          ],
        },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }

  throw new Error(`unexpected fetch: ${url}`);
}) as typeof fetch;

const cwd = process.cwd();
const repoRoot = "/workspace";
process.chdir(repoRoot);
const fetchTweetsPath = `${repoRoot}/scripts/fetch-tweets.ts`;
process.chdir(cwd);

const before = Date.now();
await import(fetchTweetsPath);
await new Promise((r) => setTimeout(r, 200));
const elapsed = Date.now() - before;

globalThis.fetch = origFetch;

let exit = 0;
const expect = (label: string, ok: boolean, detail?: string) => {
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? `  ${detail}` : ""}`);
  if (!ok) exit = 1;
};

expect(
  "Refresh-token call was made",
  calls.some((c) => c.url === "https://api.x.com/2/oauth2/token"),
);
expect(
  "/users/me called with refreshed token",
  calls.some((c) => c.url.startsWith("https://api.x.com/2/users/me")),
);
expect(
  "/users/12345/tweets called",
  calls.some((c) => c.url.startsWith("https://api.x.com/2/users/12345/tweets")),
);

const updatedTokens = JSON.parse(readFileSync(`${cwd}/.tokens.json`, "utf8"));
expect(
  "Refresh token rotated to v2 in storage",
  updatedTokens.refresh_token === "REFRESH_v2",
  `(got ${updatedTokens.refresh_token})`,
);
expect(
  "Access token rotated in storage",
  updatedTokens.access_token === "NEW_ACCESS",
);

const written = JSON.parse(readFileSync(`${cwd}/src/data/tweets.json`, "utf8"));
expect("tweets.json has 2 filtered tweets", written.length === 2, `(got ${written.length})`);
if (written.length === 2) {
  const t = written[0];
  expect("First tweet id matches", t.id === "tweet-1");
  expect("First tweet author username", t.author.screenName === "owengretzinger");
  expect("First tweet has photo media", t.media?.[0]?.type === "photo");
  expect(
    "First tweet aspect ratio computed",
    Math.abs((t.media?.[0]?.aspectRatio ?? 0) - 1.5) < 0.01,
  );
  expect("Reply (@-prefixed) was filtered", !written.find((w: { id: string }) => w.id === "tweet-3"));
  expect("Low-likes tweet was filtered", !written.find((w: { id: string }) => w.id === "tweet-2"));
}

console.log(`\nElapsed: ${elapsed}ms`);
console.log(`Total fetch calls: ${calls.length}`);
rmSync(cwd, { recursive: true, force: true });
process.exit(exit);
