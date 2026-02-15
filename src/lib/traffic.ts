import { Redis } from "@upstash/redis";

let redisClient: Redis | null = null;

export function getRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis({ url, token });
  }

  return redisClient;
}

export function getUtcDateString(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function getRecentUtcDates(days: number) {
  const clampedDays = Math.max(1, Math.min(days, 90));
  const dates: string[] = [];
  const today = new Date();
  const dayStartUtc = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );

  for (let offset = clampedDays - 1; offset >= 0; offset -= 1) {
    const date = new Date(dayStartUtc);
    date.setUTCDate(dayStartUtc.getUTCDate() - offset);
    dates.push(getUtcDateString(date));
  }

  return dates;
}
