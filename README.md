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
