"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import { useGitHubStars } from "@/hooks/useGitHubStars";
import { useTweets } from "@/hooks/useTweets";
import { useMobileCenterHover } from "@/hooks/useMobileCenterHover";
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
  const { tweets } = useTweets(5);

  // Mobile center-hover: track all hoverable items
  // Index layout: [currentExp, ...previousExp, ...projects]
  const currentExpRef = useRef<HTMLDivElement | null>(null);
  const previousExpRefs = useRef<(HTMLLIElement | null)[]>([]);
  const projectRefs = useRef<(HTMLLIElement | null)[]>([]);

  // Clean up stale refs when project count changes
  if (projectRefs.current.length > displayedProjects.length) {
    projectRefs.current = projectRefs.current.slice(0, displayedProjects.length);
  }

  // Callback to get all items - called by hook when needed
  const getItems = useCallback((): (HTMLElement | null)[] => {
    return [
      currentExpRef.current,
      ...previousExpRefs.current,
      ...projectRefs.current,
    ];
  }, []);

  // Check if element is a work item (current exp or previous exp)
  const isWorkItem = useCallback((el: HTMLElement) => {
    if (el === currentExpRef.current) return true;
    if (previousExpRefs.current.includes(el as HTMLLIElement)) return true;
    return false;
  }, []);

  const activeIndex = useMobileCenterHover(getItems, isWorkItem);

  // Find which item is active by matching the element
  const getActiveStates = useCallback(() => {
    if (activeIndex === null) {
      return { isCurrentExpActive: false, previousExpActiveIndex: null, projectActiveIndex: null };
    }

    const items = getItems();
    const activeEl = items[activeIndex];
    if (!activeEl) {
      return { isCurrentExpActive: false, previousExpActiveIndex: null, projectActiveIndex: null };
    }

    // Check if it's the current experience
    if (activeEl === currentExpRef.current) {
      return { isCurrentExpActive: true, previousExpActiveIndex: null, projectActiveIndex: null };
    }

    // Check if it's a previous experience
    const prevIndex = previousExpRefs.current.indexOf(activeEl as HTMLLIElement);
    if (prevIndex !== -1) {
      return { isCurrentExpActive: false, previousExpActiveIndex: prevIndex, projectActiveIndex: null };
    }

    // Check if it's a project
    const projIndex = projectRefs.current.indexOf(activeEl as HTMLLIElement);
    if (projIndex !== -1) {
      return { isCurrentExpActive: false, previousExpActiveIndex: null, projectActiveIndex: projIndex };
    }

    return { isCurrentExpActive: false, previousExpActiveIndex: null, projectActiveIndex: null };
  }, [activeIndex, getItems]);

  const { isCurrentExpActive, previousExpActiveIndex, projectActiveIndex } = getActiveStates();

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
        <div ref={currentExpRef}>
          <CurrentExperienceCard
            experience={currentExperience}
            colors={imageColors[currentExperience.company]}
            isActive={isCurrentExpActive}
          />
        </div>
        <PreviouslySection
          experience={previousExperience}
          colors={imageColors}
          activeIndex={previousExpActiveIndex}
          itemRefs={previousExpRefs}
        />
      </section>

      {/* Recent Tweets */}
      {tweets.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
            Recent Tweets
            <button
              type="button"
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
            </button>
          </h2>
          <TweetCarousel tweets={tweets} />
        </section>
      )}

      {/* Projects */}
      <section className="mb-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Projects
        </h2>
        <ul className="space-y-2">
          {displayedProjects.map((project, index) => (
            <li
              key={project.name}
              ref={(el) => {
                projectRefs.current[index] = el;
              }}
            >
              <ProjectCard
                project={project}
                colors={imageColors[project.name]}
                stars={project.github ? stars[project.github] : undefined}
                isActive={projectActiveIndex === index}
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
