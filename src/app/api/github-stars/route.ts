import { NextResponse } from "next/server";

// In-memory cache with TTL
const cache: {
  data: Record<string, number>;
  timestamp: number;
} = {
  data: {},
  timestamp: 0,
};

const CACHE_TTL = 60 * 60 * 1000; // 1 hour in ms

// Parse owner/repo from GitHub URL
const parseGitHubUrl = (url: string) => {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
};

// Fetch stars for a single repo
const fetchRepoStars = async (
  owner: string,
  repo: string
): Promise<number | null> => {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          // Add token if available for higher rate limits
          ...(process.env.GITHUB_TOKEN && {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          }),
        },
        next: { revalidate: 3600 }, // Cache at fetch level too
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.stargazers_count;
  } catch {
    return null;
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const urls = searchParams.get("urls")?.split(",") || [];

  if (urls.length === 0) {
    return NextResponse.json({});
  }

  // Check cache validity
  const now = Date.now();
  if (now - cache.timestamp < CACHE_TTL && Object.keys(cache.data).length > 0) {
    // Return cached data, filtering to requested URLs
    const result: Record<string, number> = {};
    for (const url of urls) {
      if (cache.data[url] !== undefined) {
        result[url] = cache.data[url];
      }
    }
    if (Object.keys(result).length === urls.length) {
      return NextResponse.json(result);
    }
  }

  // Fetch fresh data
  const starCounts: Record<string, number> = {};

  await Promise.all(
    urls.map(async (url) => {
      const parsed = parseGitHubUrl(url);
      if (!parsed) return;

      const count = await fetchRepoStars(parsed.owner, parsed.repo);
      if (count !== null) {
        starCounts[url] = count;
      }
    })
  );

  // Update cache
  cache.data = { ...cache.data, ...starCounts };
  cache.timestamp = now;

  return NextResponse.json(starCounts);
}
