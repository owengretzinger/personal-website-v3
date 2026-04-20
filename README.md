# Personal Website

A personal portfolio website built with Next.js.

## Development

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Build

```bash
bun build
bun start
```

## Analytics

This project uses:
- Vercel Web Analytics (`@vercel/analytics`) for quick pulse metrics.
- Upstash Redis for lifetime totals and day-over-day trend tracking.

Add these variables to your Vercel project (or local `.env.local`):

```bash
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

Recommended Upstash region:
- Pick the region closest to your primary audience and your Vercel function region.
- For mostly US traffic, `us-east-1` is a solid default.

## X (Twitter) tweet carousel

The home-page tweet carousel is populated at build time by `scripts/fetch-tweets.ts`,
which calls the X API v2 with **OAuth2 user-context** auth (the old app-only bearer
token can't hit `/2/users/by/username/...` on the free tier and returns 403).

Required env vars (Vercel + local):

```bash
X_CLIENT_ID=...
X_CLIENT_SECRET=...
# Required for production so the refresh token persists between builds:
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

### One-time auth bootstrap

Create a confidential OAuth 2.0 client in the X developer portal with redirect
URI `http://localhost:3939/callback`, then run:

```bash
bun run x-auth
```

That opens a browser, you authorize, and the refresh token is written to
Upstash Redis (key `x:tokens`). After that every Vercel build automatically
refreshes the access token before fetching tweets — no manual rotation needed.

If Upstash env vars aren't set, the tokens are written to a local
`.tokens.json` (gitignored) instead, which works for local `bun run fetch-data`
but won't help Vercel builds.

### Verifying the X integration

- `bun run x-test-mock` — fully mocked end-to-end test of the refresh + fetch
  pipeline. Requires no creds, no network. Good as a regression check.
- `bun run x-test` — non-destructive smoke test that uses your **real** stored
  refresh token to hit `/users/me` + `/users/{id}/tweets` and prints what it
  would write. Does **not** modify `src/data/tweets.json`. Run this after
  `bun run x-auth` to confirm everything works before redeploying.
