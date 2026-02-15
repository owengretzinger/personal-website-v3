import { NextRequest, NextResponse } from "next/server";
import {
  getRecentUtcDates,
  getRedisClient,
  getUtcDateString,
} from "@/lib/traffic";

const TOTAL_KEY = "traffic:visits:total";
const DAILY_PREFIX = "traffic:visits:day:";
const BOT_REGEX =
  /bot|spider|crawl|slurp|preview|facebookexternalhit|bingpreview|curl|wget/i;
const DEFAULT_HEADERS = { "Cache-Control": "no-store" };

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getDaysParam(request: NextRequest) {
  const rawDays = request.nextUrl.searchParams.get("days");
  const parsedDays = Number(rawDays ?? "30");

  if (!Number.isFinite(parsedDays)) {
    return 30;
  }

  return Math.max(1, Math.min(90, Math.trunc(parsedDays)));
}

function isSameOrigin(request: NextRequest) {
  const requestHost = (request.headers.get("host") ?? request.nextUrl.host).toLowerCase();
  if (!requestHost) {
    return process.env.NODE_ENV !== "production";
  }

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host.toLowerCase() === requestHost;
    } catch {
      return false;
    }
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).host.toLowerCase() === requestHost;
    } catch {
      return false;
    }
  }

  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite) {
    return secFetchSite === "same-origin" || secFetchSite === "same-site";
  }

  // If we can't establish origin, fail closed in production.
  return process.env.NODE_ENV !== "production";
}

function isValidPath(rawPath: unknown) {
  return (
    typeof rawPath === "string" &&
    rawPath.startsWith("/") &&
    rawPath.length > 0 &&
    rawPath.length <= 120 &&
    !rawPath.includes("?") &&
    !rawPath.includes("#")
  );
}

export async function POST(request: NextRequest) {
  const redis = getRedisClient();
  if (!redis) {
    return NextResponse.json(
      { ok: false, configured: false },
      { headers: DEFAULT_HEADERS }
    );
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { ok: false, configured: true, error: "forbidden" },
      { status: 403, headers: DEFAULT_HEADERS }
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return NextResponse.json(
      { ok: false, configured: true, error: "unsupported_content_type" },
      { status: 415, headers: DEFAULT_HEADERS }
    );
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  if (BOT_REGEX.test(userAgent)) {
    return NextResponse.json(
      { ok: true, configured: true, skipped: "bot" },
      { headers: DEFAULT_HEADERS }
    );
  }

  const body = (await request.json().catch(() => null)) as {
    path?: unknown;
  } | null;

  if (!isValidPath(body?.path)) {
    return NextResponse.json(
      { ok: false, configured: true, error: "bad_request" },
      { status: 400, headers: DEFAULT_HEADERS }
    );
  }

  const dayKey = `${DAILY_PREFIX}${getUtcDateString()}`;

  await redis.pipeline().incr(TOTAL_KEY).incr(dayKey).exec();

  return NextResponse.json(
    { ok: true, configured: true },
    { headers: DEFAULT_HEADERS }
  );
}

export async function GET(request: NextRequest) {
  const redis = getRedisClient();
  const days = getDaysParam(request);
  const dates = getRecentUtcDates(days);

  if (!redis) {
    return NextResponse.json(
      {
        configured: false,
        total: 0,
        today: 0,
        last7: 0,
        prev7: 0,
        trendPct: null,
        daily: dates.map((date) => ({ date, visits: 0 })),
      },
      { headers: DEFAULT_HEADERS }
    );
  }

  const dailyKeys = dates.map((date) => `${DAILY_PREFIX}${date}`);
  const [totalRaw, dailyRaw] = await redis
    .pipeline()
    .get<number>(TOTAL_KEY)
    .mget<number[]>(...dailyKeys)
    .exec<[number | null, (number | null)[]]>();

  const counts = (dailyRaw ?? []).map((value) => Number(value ?? 0));
  const total = Number(totalRaw ?? 0);
  const today = counts[counts.length - 1] ?? 0;
  const last7 = counts.slice(-7).reduce((sum, value) => sum + value, 0);
  const prev7 = counts.slice(-14, -7).reduce((sum, value) => sum + value, 0);
  const trendPct = prev7 > 0 ? ((last7 - prev7) / prev7) * 100 : null;

  return NextResponse.json(
    {
      configured: true,
      total,
      today,
      last7,
      prev7,
      trendPct,
      daily: dates.map((date, index) => ({
        date,
        visits: counts[index] ?? 0,
      })),
    },
    { headers: DEFAULT_HEADERS }
  );
}
