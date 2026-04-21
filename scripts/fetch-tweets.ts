import * as fs from "fs";
import * as path from "path";
import { getAccessToken } from "./x-tokens";

type TweetData = {
  id: string;
  text: string;
  createdAt: string;
  author: {
    name: string;
    screenName: string;
    profileImageUrl: string;
  };
  metrics: {
    likes: number;
    retweets: number;
    replies: number;
  };
  media?: {
    type: "photo" | "video";
    url: string;
    aspectRatio?: number;
  }[];
  article?: {
    title: string;
    preview: string;
    cover?: string;
  };
};

const TWITTER_USERNAME = "owengretzinger";
const MIN_LIKES_THRESHOLD = 40;

type RawTweet = {
  id: string;
  text: string;
  created_at: string;
  public_metrics?: {
    like_count?: number;
    retweet_count?: number;
    reply_count?: number;
  };
  attachments?: { media_keys?: string[] };
  referenced_tweets?: { type: string; id: string }[];
  article?: {
    title?: string;
    preview_text?: string;
    cover_media?: string;
  };
};

type RawMedia = {
  media_key: string;
  type: string;
  url?: string;
  preview_image_url?: string;
  width?: number;
  height?: number;
};

async function fetchTweets(): Promise<TweetData[]> {
  let accessToken: string;
  try {
    accessToken = await getAccessToken();
  } catch (err) {
    console.error((err as Error).message);
    return [];
  }

  const headers = { Authorization: `Bearer ${accessToken}` };

  try {
    const meResponse = await fetch(
      "https://api.x.com/2/users/me?user.fields=profile_image_url,name,username",
      { headers },
    );

    if (!meResponse.ok) {
      console.error(
        "X /users/me lookup failed:",
        meResponse.status,
        await meResponse.text(),
      );
      return [];
    }

    const meData = await meResponse.json();
    const me = meData.data;
    if (!me?.id) {
      console.error("Could not get user id from /users/me", meData);
      return [];
    }

    const tweetsParams = new URLSearchParams({
      max_results: "50",
      "tweet.fields": "created_at,public_metrics,attachments,referenced_tweets,article",
      expansions: "attachments.media_keys,article.cover_media",
      "media.fields": "url,type,width,height,preview_image_url",
      exclude: "replies,retweets",
    });

    const tweetsResponse = await fetch(
      `https://api.x.com/2/users/${me.id}/tweets?${tweetsParams}`,
      { headers },
    );

    if (!tweetsResponse.ok) {
      const errorText = await tweetsResponse.text();
      console.error("X tweets fetch failed:", tweetsResponse.status, errorText);
      return [];
    }

    const tweetsData = await tweetsResponse.json();
    const tweets: RawTweet[] = tweetsData.data ?? [];

    const mediaMap = new Map<
      string,
      { url: string; type: string; width?: number; height?: number }
    >();
    for (const m of (tweetsData.includes?.media as RawMedia[] | undefined) ??
      []) {
      mediaMap.set(m.media_key, {
        url: m.url || m.preview_image_url || "",
        type: m.type,
        width: m.width,
        height: m.height,
      });
    }

    if (tweets.length === 0) return [];

    const hasRenderableText = (text: string) =>
      text.replace(/\s*https?:\/\/t\.co\/\w+/g, "").trim().length > 0;

    const filtered = tweets.filter(
      (t) =>
        !t.text.startsWith("@") &&
        (t.public_metrics?.like_count || 0) >= MIN_LIKES_THRESHOLD &&
        (hasRenderableText(t.text) ||
          (t.attachments?.media_keys?.length ?? 0) > 0 ||
          !!t.article?.title),
    );

    return filtered.map((tweet) => {
      const media: TweetData["media"] = [];
      for (const key of tweet.attachments?.media_keys ?? []) {
        const m = mediaMap.get(key);
        if (m && (m.type === "photo" || m.type === "video")) {
          media.push({
            type: m.type as "photo" | "video",
            url: m.url,
            aspectRatio: m.width && m.height ? m.width / m.height : undefined,
          });
        }
      }
      return {
        id: tweet.id,
        text: tweet.text,
        createdAt: tweet.created_at,
        author: {
          name: me.name ?? "owen",
          screenName: me.username ?? TWITTER_USERNAME,
          profileImageUrl:
            me.profile_image_url ||
            "https://pbs.twimg.com/profile_images/default.jpg",
        },
        metrics: {
          likes: tweet.public_metrics?.like_count || 0,
          retweets: tweet.public_metrics?.retweet_count || 0,
          replies: tweet.public_metrics?.reply_count || 0,
        },
        media: media.length > 0 ? media : undefined,
        article: tweet.article?.title
          ? {
              title: tweet.article.title,
              preview: tweet.article.preview_text ?? "",
              cover: tweet.article.cover_media
                ? mediaMap.get(tweet.article.cover_media)?.url
                : undefined,
            }
          : undefined,
      };
    });
  } catch (error) {
    console.error("X API error:", error);
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
