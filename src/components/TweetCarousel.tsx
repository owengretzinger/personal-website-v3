"use client";

import { useState } from "react";
import { TweetCard, type Tweet } from "./TweetCard";

interface TweetCarouselProps {
  tweets: Tweet[];
  loading?: boolean;
}

export const TweetCarousel = ({ tweets, loading }: TweetCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = loading ? 5 : tweets.length;

  if (!loading && tweets.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? tweets.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === tweets.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative">
      {/* Navigation - above tweet */}
      {count > 1 && (
        <div className="flex items-center justify-start gap-2 mb-2">
          {/* Arrow buttons */}
          <button
            onClick={goToPrevious}
            disabled={loading}
            className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors disabled:opacity-50"
            aria-label="Previous tweet"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                onClick={() => !loading && setCurrentIndex(index)}
                disabled={loading}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  index === currentIndex
                    ? "bg-neutral-600 dark:bg-neutral-300"
                    : "bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400 dark:hover:bg-neutral-500"
                }`}
                aria-label={`Go to tweet ${index + 1}`}
              />
            ))}
          </div>

          {/* Arrow buttons */}
          <button
            onClick={goToNext}
            disabled={loading}
            className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors disabled:opacity-50"
            aria-label="Next tweet"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      )}

      {/* Tweet Card */}
      {loading ? (
        <TweetCard tweet={null} loading={true} />
      ) : (
        <TweetCard tweet={tweets[currentIndex]} />
      )}
    </div>
  );
};
