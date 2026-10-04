import * as fs from "fs";
import * as path from "path";
import type { Tweet } from "../src/components/TweetCard";

const TWITTER_USERNAME = "owengretzinger";
const MIN_LIKES_THRESHOLD = 40;
const PAGES_TO_SCAN = 3;
const FXTWITTER = "https://api.fxtwitter.com";

type FxMedia = {
  type: string;
  url: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
};

type FxArticle = {
  title?: string;
  preview_text?: string;
  cover_media?: { media_info?: { original_img_url?: string } };
};

type FxStatus = {
  id: string;
  text: string;
  created_timestamp: number;
  author: { name: string; screen_name: string; avatar_url: string };
  likes: number;
  reposts: number | null;
  replies: number;
  replying_to: unknown;
  media?: { all?: FxMedia[] };
  article?: FxArticle | null;
};

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json() as Promise<T>;
}

async function fetchTimeline(): Promise<FxStatus[]> {
  const statuses: FxStatus[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < PAGES_TO_SCAN; page++) {
    const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    const data = await getJson<{
      results: FxStatus[];
      cursor?: { bottom?: string };
    }>(`${FXTWITTER}/2/profile/${TWITTER_USERNAME}/statuses${query}`);
    statuses.push(...data.results);
    cursor = data.cursor?.bottom;
    if (!cursor || data.results.length === 0) break;
  }
  return statuses;
}

// The timeline endpoint omits article cover images; the single-status endpoint includes them.
async function fetchArticleCover(id: string): Promise<string | undefined> {
  const data = await getJson<{ tweet: FxStatus }>(
    `${FXTWITTER}/${TWITTER_USERNAME}/status/${id}`,
  );
  return data.tweet.article?.cover_media?.media_info?.original_img_url;
}

async function toTweet(s: FxStatus): Promise<Tweet> {
  const media = (s.media?.all ?? [])
    .filter((m) => m.type === "photo" || m.type === "video")
    .map((m) => ({
      type: m.type as "photo" | "video",
      url: m.type === "video" ? (m.thumbnail_url ?? "") : m.url,
      aspectRatio: m.width && m.height ? m.width / m.height : undefined,
    }));

  return {
    id: s.id,
    text: s.text,
    createdAt: new Date(s.created_timestamp * 1000).toISOString(),
    author: {
      name: s.author.name,
      screenName: s.author.screen_name,
      profileImageUrl: s.author.avatar_url,
    },
    metrics: {
      likes: s.likes,
      retweets: s.reposts ?? 0,
      replies: s.replies,
    },
    media: media.length > 0 ? media : undefined,
    article: s.article?.title
      ? {
          title: s.article.title,
          preview: s.article.preview_text ?? "",
          cover: await fetchArticleCover(s.id),
        }
      : undefined,
  };
}

async function fetchTweets(): Promise<Tweet[]> {
  try {
    const statuses = await fetchTimeline();
    const filtered = statuses.filter(
      (s) =>
        s.author.screen_name.toLowerCase() === TWITTER_USERNAME &&
        !s.replying_to &&
        !s.text.startsWith("@") &&
        s.likes >= MIN_LIKES_THRESHOLD &&
        (s.text.trim().length > 0 ||
          (s.media?.all?.length ?? 0) > 0 ||
          !!s.article?.title),
    );
    return await Promise.all(filtered.map(toTweet));
  } catch (error) {
    console.error("fxtwitter error:", error);
    return [];
  }
}

async function main() {
  console.log("Fetching tweets...");

  const outputPath = path.join(process.cwd(), "src/data/tweets.json");

  const tweets = await fetchTweets();

  if (tweets.length > 0) {
    fs.writeFileSync(outputPath, JSON.stringify(tweets, null, 2));
    console.log(`Saved ${tweets.length} tweets to ${outputPath}`);
  } else {
    if (fs.existsSync(outputPath)) {
      console.log("Fetch returned no tweets, keeping existing data");
    } else {
      fs.writeFileSync(outputPath, "[]");
      console.log("No tweets fetched, created empty file");
    }
  }
}

main();
