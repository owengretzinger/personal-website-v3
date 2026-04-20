/**
 * One-time browser-based OAuth2 PKCE flow for the X API.
 *
 * Run locally with:
 *   bun run x-auth
 *
 * Requires X_CLIENT_ID / X_CLIENT_SECRET (the OAuth 2.0 client created in the
 * X developer portal). Optionally requires UPSTASH_REDIS_REST_URL +
 * UPSTASH_REDIS_REST_TOKEN — when present the obtained refresh token is
 * persisted to Redis under key `x:tokens` so that the Vercel build can read &
 * refresh it on every deploy. When Redis env vars are missing the tokens are
 * written to a local gitignored `.tokens.json` file as a fallback.
 */
import { createServer } from "node:http";
import { createHash, randomBytes } from "node:crypto";
import { exec } from "node:child_process";
import { writeFileSync } from "node:fs";
import { saveTokens, type StoredTokens } from "./x-tokens";

const CLIENT_ID = process.env.X_CLIENT_ID;
const CLIENT_SECRET = process.env.X_CLIENT_SECRET;
const PORT = Number(process.env.X_AUTH_PORT ?? 3939);
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const SCOPES = ["tweet.read", "users.read", "offline.access"].join(" ");

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Missing X_CLIENT_ID or X_CLIENT_SECRET");
  process.exit(1);
}

const base64url = (buf: Buffer) =>
  buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const basicAuth = `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`;

const codeVerifier = base64url(randomBytes(32));
const codeChallenge = base64url(createHash("sha256").update(codeVerifier).digest());
const state = base64url(randomBytes(16));

const authUrl = new URL("https://x.com/i/oauth2/authorize");
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("client_id", CLIENT_ID);
authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
authUrl.searchParams.set("scope", SCOPES);
authUrl.searchParams.set("state", state);
authUrl.searchParams.set("code_challenge", codeChallenge);
authUrl.searchParams.set("code_challenge_method", "S256");

const tokens = await new Promise<StoredTokens>((resolve, reject) => {
  const server = createServer(async (req, res) => {
    if (!req.url) return res.writeHead(404).end();
    const url = new URL(req.url, `http://localhost:${PORT}`);
    if (url.pathname !== "/callback") return res.writeHead(404).end();

    const code = url.searchParams.get("code");
    if (url.searchParams.get("state") !== state || !code) {
      res.writeHead(400).end("state mismatch or missing code");
      return reject(new Error("state mismatch or missing code"));
    }

    res.writeHead(200, { "content-type": "text/html" });
    res.end("<h1>Authorized — you can close this tab.</h1>");

    try {
      const r = await fetch("https://api.x.com/2/oauth2/token", {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          authorization: basicAuth,
        },
        body: new URLSearchParams({
          code,
          grant_type: "authorization_code",
          redirect_uri: REDIRECT_URI,
          code_verifier: codeVerifier,
        }),
      });
      const t = await r.json();
      if (!r.ok) throw new Error(`Token exchange failed: ${JSON.stringify(t)}`);
      server.close();
      resolve({
        access_token: t.access_token,
        refresh_token: t.refresh_token,
        expires_at: Date.now() + t.expires_in * 1000,
      });
    } catch (err) {
      reject(err);
    }
  });

  server.listen(PORT, () => {
    const link = authUrl.toString();
    console.log("\nOpen this URL in your browser to authorize:\n", link, "\n");
    if (process.platform === "darwin") exec(`open "${link}"`);
    else if (process.platform === "win32") exec(`start "" "${link}"`);
    else exec(`xdg-open "${link}"`);
  });
});

await saveTokens(tokens);

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  writeFileSync(".tokens.json", JSON.stringify(tokens, null, 2));
  console.log("Saved tokens to .tokens.json (Upstash env vars not set)");
} else {
  console.log("Saved tokens to Upstash Redis under key x:tokens");
}
