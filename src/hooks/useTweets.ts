import { useState, useEffect } from "react";
import { type Tweet } from "@/components/TweetCard";

export const useTweets = (count: number = 5) => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        const response = await fetch(`/api/tweets?count=${count}`);
        if (!response.ok) {
          setLoading(false);
          return;
        }
        const data = await response.json();
        if (data && !data.error) {
          setTweets(data);
        }
      } catch (error) {
        console.error("Error fetching tweets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTweets();
  }, [count]);

  return { tweets, loading };
};
