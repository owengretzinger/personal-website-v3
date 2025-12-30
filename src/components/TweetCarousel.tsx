import { TweetCard, type Tweet } from "./TweetCard";
import { TweetCarouselClient } from "./TweetCarouselClient";

interface TweetCarouselProps {
  tweets: Tweet[];
}

export const TweetCarousel = ({ tweets }: TweetCarouselProps) => {
  if (tweets.length === 0) {
    return null;
  }

  // Pre-render all tweets for SSR - client component will handle visibility
  const tweetCards = tweets.map((tweet, index) => (
    <TweetCard key={tweet.id} tweet={tweet} priority={index === 0} />
  ));

  return (
    <TweetCarouselClient tweetCount={tweets.length}>
      {tweetCards}
    </TweetCarouselClient>
  );
};
