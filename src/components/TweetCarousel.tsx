"use client";

import { useState } from "react";
import { TweetCard, type Tweet } from "./TweetCard";

interface TweetCarouselProps {
  tweets: Tweet[];
}

export const TweetCarousel = ({ tweets }: TweetCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (tweets.length === 0) {
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
      {tweets.length > 1 && (
        <div className="flex items-center justify-start gap-2 mb-2">
          <button
            onClick={goToPrevious}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
            aria-label="Previous tweet"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div className="flex items-center -mx-1.5">
            {tweets.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className="min-w-6 min-h-6 -mx-[3px] flex items-center justify-center"
                aria-label={`Go to tweet ${index + 1}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === currentIndex
                      ? "bg-neutral-600 dark:bg-neutral-300"
                      : "bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400 dark:hover:bg-neutral-500"
                  }`}
                />
              </button>
            ))}
          </div>

          <button
            onClick={goToNext}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
            aria-label="Next tweet"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      )}

      <TweetCard tweet={tweets[currentIndex]} priority={currentIndex === 0} />
    </div>
  );
};
