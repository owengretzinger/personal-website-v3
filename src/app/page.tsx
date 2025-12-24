"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useGitHubStars } from "@/hooks/useGitHubStars";
import { useTweets } from "@/hooks/useTweets";
import { ProjectCard } from "@/components/ProjectCard";
import { TweetCarousel } from "@/components/TweetCarousel";
import { CurrentExperienceCard } from "@/components/CurrentExperienceCard";
import { PreviouslySection } from "@/components/PreviouslySection";
import { SocialLinks } from "@/components/SocialLinks";
import { projects } from "@/data/projects";
import { experience } from "@/data/experience";
import { imageColors } from "@/data/colors";

export default function Home() {
  const [showAllProjects, setShowAllProjects] = useState(false);
  const displayedProjects = showAllProjects ? projects : projects.slice(0, 5);

  const currentExperience = experience[0];
  const previousExperience = experience.slice(1);

  // Fetch GitHub stars for projects with github URLs
  const githubUrls = useMemo(
    () => projects.map((p) => p.github).filter(Boolean) as string[],
    []
  );
  const stars = useGitHubStars(githubUrls);
  const { tweets, loading: tweetLoading } = useTweets(5);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 md:py-16">
      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3">
          <Image
            src="/pfp.png"
            alt="Owen Gretzinger"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <h1 className="text-xl font-medium tracking-tight">
            owen gretzinger
          </h1>
        </div>
      </header>

      {/* Currently */}
      <section className="mb-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Currently
        </h2>
        <CurrentExperienceCard
          experience={currentExperience}
          colors={imageColors[currentExperience.company]}
        />
        <PreviouslySection experience={previousExperience} colors={imageColors} />
      </section>

      {/* Recent Tweets */}
      {(tweets.length > 0 || tweetLoading) && (
        <section className="mb-10">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
            Recent Tweets
            <span className="relative group cursor-help">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="opacity-70"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
              <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 px-2 py-1 text-[10px] font-normal normal-case tracking-normal text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                5 most recent tweets with 40+ likes
              </span>
            </span>
          </h2>
          <TweetCarousel tweets={tweets} loading={tweetLoading} />
        </section>
      )}

      {/* Projects */}
      <section className="mb-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Projects
        </h2>
        <ul className="space-y-2">
          {displayedProjects.map((project) => (
            <li key={project.name}>
              <ProjectCard
                project={project}
                colors={imageColors[project.name]}
                stars={project.github ? stars[project.github] : undefined}
              />
            </li>
          ))}
        </ul>
        <button
          onClick={() => setShowAllProjects(!showAllProjects)}
          className="mt-1 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-all px-2 py-1"
        >
          {showAllProjects ? "show less" : `show more`}
        </button>
      </section>

      {/* Footer / Social */}
      <SocialLinks />
    </main>
  );
}
