"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useHomeHoverState } from "@/hooks/useHomeHoverState";
import { ProjectCard } from "@/components/ProjectCard";
import { CurrentExperienceCard } from "@/components/CurrentExperienceCard";
import { PreviouslySection } from "@/components/PreviouslySection";
import { SocialLinks } from "@/components/SocialLinks";
import { type Project } from "@/data/projects";
import { type Experience } from "@/data/experience";
import { type Article } from "@/lib/articles";

interface HomeContentProps {
  projects: Project[];
  experience: Experience[];
  articles: Article[];
  tweetsSection: ReactNode;
  imageColors: Record<string, string[]>;
  stars: Record<string, number>;
}

export const HomeContent = ({
  projects,
  experience,
  articles,
  tweetsSection,
  imageColors,
  stars,
}: HomeContentProps) => {
  const [showAllProjects, setShowAllProjects] = useState(false);
  const displayedProjects = showAllProjects ? projects : projects.slice(0, 5);

  const currentExperience = experience[0];
  const previousExperience = experience.slice(1);

  const {
    currentExpRef,
    previousExpRefs,
    projectRefs,
    isCurrentExpActive,
    previousExpActiveIndex,
    projectActiveIndex,
  } = useHomeHoverState(previousExperience.length, displayedProjects.length);

  return (
    <main className="mx-auto max-w-2xl px-4 md:px-6 py-12 md:py-16">
      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3">
          <Image
            src="/pfp.png"
            alt="Owen Gretzinger"
            width={40}
            height={40}
            className="rounded-lg"
            priority
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
            priority
          />
        </div>
        <PreviouslySection
          experience={previousExperience}
          colors={imageColors}
          activeIndex={previousExpActiveIndex}
          itemRefs={previousExpRefs}
        />
      </section>

      {/* Recent Tweets - server rendered */}
      {tweetsSection}

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
                priority={index < 5}
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

      {/* Articles */}
      {articles.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Articles
          </h2>
          <ul className="space-y-2">
            {articles.map((article) => (
              <li key={article.slug}>
                <Link
                  href={`/articles/${article.slug}`}
                  className="flex items-center gap-3 -m-2 p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  {article.cover && (
                    <Image
                      src={article.cover}
                      alt=""
                      width={96}
                      height={48}
                      className="rounded shrink-0 w-24 h-12 object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm truncate">{article.title}</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {article.excerpt}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Footer / Social */}
      <SocialLinks />
    </main>
  );
};
