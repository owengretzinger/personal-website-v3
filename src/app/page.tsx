import { HomeContent } from "@/components/HomeContent";
import { TweetCarousel } from "@/components/TweetCarousel";
import { projects } from "@/data/projects";
import { experience } from "@/data/experience";
import { imageColors } from "@/data/colors";
import tweetsData from "@/data/tweets.json";
import starsData from "@/data/github-stars.json";
import { type Tweet } from "@/components/TweetCard";

export default function Home() {
  const tweets = (tweetsData as Tweet[]).slice(0, 5);
  const stars = starsData as Record<string, number>;

  // Render tweets section at server level for SSR
  const tweetsSection =
    tweets.length > 0 ? (
      <section key="tweets" className="mb-10">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
          Recent Tweets
          <span
            className="relative group cursor-help"
            aria-label="Info: 5 most recent tweets with 40+ likes"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="opacity-70"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
            <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 px-2 py-1 text-[10px] font-normal normal-case tracking-normal text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity pointer-events-none z-50">
              5 most recent tweets with 40+ likes
            </span>
          </span>
        </h2>
        <TweetCarousel tweets={tweets} />
      </section>
    ) : null;

  return (
    <HomeContent
      projects={projects}
      experience={experience}
      tweetsSection={tweetsSection}
      imageColors={imageColors}
      stars={stars}
    />
  );
}
