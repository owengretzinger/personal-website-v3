import { NextResponse } from "next/server";

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
};

type CacheEntry = {
  data: TweetData[];
  timestamp: number;
};

const cache: CacheEntry = {
  data: [],
  timestamp: 0,
};

const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours
const TWITTER_USERNAME = "owengretzinger";
const MIN_LIKES_THRESHOLD = 40;

async function fetchTweets(): Promise<TweetData[]> {
  const bearerToken = process.env.TWITTER_API_BEARER_TOKEN;
  if (!bearerToken) {
    return [];
  }

  try {
    // First, get user ID
    const userResponse = await fetch(
      `https://api.twitter.com/2/users/by/username/${TWITTER_USERNAME}?user.fields=profile_image_url`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    );

    if (!userResponse.ok) {
      console.error("Twitter user lookup failed:", userResponse.status);
      return [];
    }

    const userData = await userResponse.json();
    const userId = userData.data?.id;
    const profileImageUrl = userData.data?.profile_image_url;

    if (!userId) {
      console.error("Could not get user ID");
      return [];
    }

    // Get latest tweets (exclude replies and retweets)
    const tweetsResponse = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?max_results=50&tweet.fields=created_at,public_metrics,attachments&expansions=attachments.media_keys&media.fields=url,type,width,height,preview_image_url&exclude=replies,retweets`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    );

    if (!tweetsResponse.ok) {
      const errorText = await tweetsResponse.text();
      console.error("Twitter tweets fetch failed:", tweetsResponse.status, errorText);
      return [];
    }

    const tweetsData = await tweetsResponse.json();
    const tweets = tweetsData.data;
    const mediaMap = new Map<
      string,
      { url: string; type: string; width?: number; height?: number }
    >();

    // Build media map from includes
    if (tweetsData.includes?.media) {
      for (const m of tweetsData.includes.media) {
        mediaMap.set(m.media_key, {
          url: m.url || m.preview_image_url || "",
          type: m.type,
          width: m.width,
          height: m.height,
        });
      }
    }

    if (!tweets || tweets.length === 0) {
      return [];
    }

    // Filter tweets: not replies and have enough likes
    const filteredTweets = tweets.filter(
      (t: { text: string; public_metrics?: { like_count?: number } }) =>
        !t.text.startsWith("@") &&
        (t.public_metrics?.like_count || 0) >= MIN_LIKES_THRESHOLD
    );

    // Map to our format
    return filteredTweets.map(
      (tweet: {
        id: string;
        text: string;
        created_at: string;
        public_metrics?: {
          like_count?: number;
          retweet_count?: number;
          reply_count?: number;
        };
        attachments?: { media_keys?: string[] };
      }) => {
        const media: TweetData["media"] = [];

        if (tweet.attachments?.media_keys) {
          for (const key of tweet.attachments.media_keys) {
            const m = mediaMap.get(key);
            if (m && (m.type === "photo" || m.type === "video")) {
              media.push({
                type: m.type as "photo" | "video",
                url: m.url,
                aspectRatio: m.width && m.height ? m.width / m.height : undefined,
              });
            }
          }
        }

        return {
          id: tweet.id,
          text: tweet.text,
          createdAt: tweet.created_at,
          author: {
            name: "owen",
            screenName: TWITTER_USERNAME,
            profileImageUrl: profileImageUrl || "https://pbs.twimg.com/profile_images/default.jpg",
          },
          metrics: {
            likes: tweet.public_metrics?.like_count || 0,
            retweets: tweet.public_metrics?.retweet_count || 0,
            replies: tweet.public_metrics?.reply_count || 0,
          },
          media: media.length > 0 ? media : undefined,
        };
      }
    );
  } catch (error) {
    console.error("Twitter API error:", error);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const count = Math.min(parseInt(searchParams.get("count") || "5", 10), 10);
  const now = Date.now();

  // Return cached data if still valid
  if (cache.data.length > 0 && now - cache.timestamp < CACHE_DURATION) {
    return NextResponse.json(cache.data.slice(0, count));
  }

  // Fetch fresh data
  const tweets = await fetchTweets();

  if (tweets.length > 0) {
    cache.data = tweets;
    cache.timestamp = now;
    return NextResponse.json(tweets.slice(0, count));
  }

  // Return stale cache if fetch failed
  if (cache.data.length > 0) {
    return NextResponse.json(cache.data.slice(0, count));
  }

  return NextResponse.json({ error: "Failed to fetch tweets" }, { status: 500 });
}
