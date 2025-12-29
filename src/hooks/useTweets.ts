import { type Tweet } from "@/components/TweetCard";
import tweetsData from "@/data/tweets.json";

export const useTweets = (count: number = 5) => {
  const tweets = (tweetsData as Tweet[]).slice(0, count);
  return { tweets, loading: false };
};
