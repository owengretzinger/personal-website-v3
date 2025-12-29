import * as fs from "fs";
import * as path from "path";

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

const TWITTER_USERNAME = "owengretzinger";
const MIN_LIKES_THRESHOLD = 40;

async function fetchTweets(): Promise<TweetData[]> {
  const bearerToken = process.env.TWITTER_API_BEARER_TOKEN;
  if (!bearerToken) {
    console.error("TWITTER_API_BEARER_TOKEN not set");
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

async function main() {
  console.log("Fetching tweets...");

  const outputPath = path.join(process.cwd(), "src/data/tweets.json");

  const tweets = await fetchTweets();

  if (tweets.length > 0) {
    fs.writeFileSync(outputPath, JSON.stringify(tweets, null, 2));
    console.log(`Saved ${tweets.length} tweets to ${outputPath}`);
  } else {
    // Keep existing file if fetch failed
    if (fs.existsSync(outputPath)) {
      console.log("Fetch returned no tweets, keeping existing data");
    } else {
      // Create empty array if no existing file
      fs.writeFileSync(outputPath, "[]");
      console.log("No tweets fetched, created empty file");
    }
  }
}

main();
