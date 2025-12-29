"use client";

import Image from "next/image";
import { XIcon } from "./icons";

const ReplyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z" />
  </svg>
);

const RetweetIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" />
  </svg>
);

const HeartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" />
  </svg>
);

export type Tweet = {
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

interface TweetCardProps {
  tweet: Tweet;
  priority?: boolean;
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 30) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else if (diffDays > 0) {
      return `${diffDays}d`;
    } else if (diffHours > 0) {
      return `${diffHours}h`;
    } else if (diffMins > 0) {
      return `${diffMins}m`;
    }
    return "now";
  } catch {
    return "";
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

// Decode HTML entities like &gt; &lt; &amp; etc.
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&nbsp;": " ",
  };
  return text.replace(/&[^;]+;/g, (match) => entities[match] || match);
}

// Parse tweet text to handle links and mentions
function parseTweetText(text: string): React.ReactNode[] {
  // Decode HTML entities first
  const decodedText = decodeHtmlEntities(text);
  // Remove ALL t.co URLs (they're just tracking links)
  const cleanedText = decodedText
    .replace(/\s*https?:\/\/t\.co\/\w+/g, "")
    .trim();

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  // Regex for @mentions, #hashtags, and URLs
  const regex = /(@\w+)|(#\w+)|(https?:\/\/[^\s]+)/g;
  let match;

  while ((match = regex.exec(cleanedText)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(cleanedText.slice(lastIndex, match.index));
    }

    if (match[1]) {
      // @mention
      parts.push(
        <span key={match.index} className="text-blue-500">
          {match[1]}
        </span>
      );
    } else if (match[2]) {
      // #hashtag
      parts.push(
        <span key={match.index} className="text-blue-500">
          {match[2]}
        </span>
      );
    } else if (match[3]) {
      // URL - show shortened version
      const url = match[3];
      const displayUrl = url
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .slice(0, 30);
      parts.push(
        <span
          key={match.index}
          className="text-blue-500 hover:underline cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            window.open(url, "_blank");
          }}
        >
          {displayUrl}
          {url.length > 30 ? "..." : ""}
        </span>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < cleanedText.length) {
    parts.push(cleanedText.slice(lastIndex));
  }

  return parts;
}

export const TweetCard = ({ tweet, priority = false }: TweetCardProps) => {
  const tweetUrl = `https://x.com/${tweet.author.screenName}/status/${tweet.id}`;

  return (
    <a
      href={tweetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block rounded-lg p-3 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Image
            src={tweet.author.profileImageUrl.replace("_normal", "_x96")}
            alt={tweet.author.name}
            width={20}
            height={20}
            className="rounded-full"
            priority={priority}
          />
          <span className="text-xs text-neutral-600 dark:text-neutral-400">
            @{tweet.author.screenName}
          </span>
          <span className="text-xs text-neutral-400 dark:text-neutral-500 -ml-1">
            ·
          </span>
          <span className="text-xs text-neutral-400 dark:text-neutral-500 -ml-1">
            {formatRelativeTime(tweet.createdAt)}
          </span>
        </div>
        <XIcon className="w-3.5 h-3.5 text-neutral-400 ml-4" />
      </div>

      {/* Tweet text */}
      <p className="text-sm leading-relaxed mb-2 whitespace-pre-wrap">
        {parseTweetText(tweet.text)}
      </p>

      {/* Media thumbnails */}
      {tweet.media && tweet.media.length > 0 && (
        <div className="mb-2 flex gap-1">
          {tweet.media.map(
            (m, i) =>
              m.url && (
                <div key={i} className="relative min-w-0">
                  <Image
                    src={m.url}
                    alt={`Tweet media ${i + 1}`}
                    width={
                      m.aspectRatio ? Math.round(120 * m.aspectRatio) : 180
                    }
                    height={120}
                    className="rounded-lg h-auto max-h-[120px] w-full object-cover"
                    priority={priority}
                  />
                  {/* Play icon for videos */}
                  {m.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 rounded-full p-2">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="white"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              )
          )}
        </div>
      )}

      {/* Metrics with icons */}
      <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
        {tweet.metrics.replies >= 1 && (
          <span className="flex items-center gap-1">
            <ReplyIcon /> {formatNumber(tweet.metrics.replies)}
          </span>
        )}
        {tweet.metrics.retweets >= 1 && (
          <span className="flex items-center gap-1">
            <RetweetIcon /> {formatNumber(tweet.metrics.retweets)}
          </span>
        )}
        <span className="flex items-center gap-1">
          <HeartIcon /> {formatNumber(tweet.metrics.likes)}
        </span>
      </div>
    </a>
  );
};
