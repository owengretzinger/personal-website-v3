"use client";

import { useEffect } from "react";

const TRACKED_AT_KEY = "traffic:last-tracked-at";
const TRACK_WINDOW_MS = 30 * 60 * 1000;

export function TrafficTracker() {
  useEffect(() => {
    const trackVisit = async () => {
      const lastTrackedAt = Number(sessionStorage.getItem(TRACKED_AT_KEY) ?? "0");
      const now = Date.now();
      const shouldTrack = !lastTrackedAt || now - lastTrackedAt >= TRACK_WINDOW_MS;

      if (!shouldTrack) {
        return;
      }

      const res = await fetch("/api/traffic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path: window.location.pathname }),
        keepalive: true,
        cache: "no-store",
      });

      if (!res.ok) {
        return;
      }

      const data = (await res.json().catch(() => null)) as
        | { configured?: unknown }
        | null;
      if (data?.configured !== true) {
        return;
      }

      sessionStorage.setItem(TRACKED_AT_KEY, String(now));
    };

    void trackVisit().catch(() => undefined);
  }, []);

  return null;
}
