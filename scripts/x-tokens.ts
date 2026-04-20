/**
 * Shared helpers for storing & refreshing X (Twitter) OAuth2 user-context tokens.
 *
 * Tokens are persisted in Upstash Redis (key `x:tokens`) so that successive
 * Vercel builds can read the latest refresh token and rotate it. When Upstash
 * env vars are not present, falls back to a local `.tokens.json` file (handy
 * for local development).
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { Redis } from "@upstash/redis";

const REDIS_KEY = "x:tokens";
const LOCAL_FILE = ".tokens.json";

export type StoredTokens = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
};

let redis: Redis | null | undefined;
function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  redis = url && token ? new Redis({ url, token }) : null;
  return redis;
}

export async function loadTokens(): Promise<StoredTokens | null> {
  const r = getRedis();
  if (r) {
    const value = await r.get<StoredTokens | string>(REDIS_KEY);
    if (!value) return null;
    return typeof value === "string" ? (JSON.parse(value) as StoredTokens) : value;
  }
  if (!existsSync(LOCAL_FILE)) return null;
  return JSON.parse(readFileSync(LOCAL_FILE, "utf8")) as StoredTokens;
}

export async function saveTokens(tokens: StoredTokens): Promise<void> {
  const r = getRedis();
  if (r) {
    await r.set(REDIS_KEY, JSON.stringify(tokens));
    return;
  }
  writeFileSync(LOCAL_FILE, JSON.stringify(tokens, null, 2));
}

/**
 * Returns a valid access token, refreshing if the stored one is within `skewMs`
 * of expiry (default 60s). Throws if no refresh token is available or the
 * refresh call fails — callers should treat that as a hard error.
 */
export async function getAccessToken(skewMs = 60_000): Promise<string> {
  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Missing X_CLIENT_ID / X_CLIENT_SECRET");
  }

  const stored = await loadTokens();
  if (!stored?.refresh_token) {
    throw new Error(
      "No X refresh token found — run `bun run x-auth` once locally to bootstrap.",
    );
  }

  if (stored.access_token && stored.expires_at - skewMs > Date.now()) {
    return stored.access_token;
  }

  const basicAuth = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
  const res = await fetch("https://api.x.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      authorization: basicAuth,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: stored.refresh_token,
    }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`X token refresh failed: ${JSON.stringify(body)}`);
  }
  const fresh: StoredTokens = {
    access_token: body.access_token,
    refresh_token: body.refresh_token ?? stored.refresh_token,
    expires_at: Date.now() + body.expires_in * 1000,
  };
  await saveTokens(fresh);
  return fresh.access_token;
}
