"use client";

import { useState, useMemo } from "react";
import { useImageColors } from "@/hooks/useImageColors";
import { useGitHubStars } from "@/hooks/useGitHubStars";
import { ProjectCard } from "@/components/ProjectCard";
import { projects } from "@/data/projects";
import { BoardyCard } from "@/components/BoardyCard";
import { PreviouslySection } from "@/components/PreviouslySection";
import { SocialLinks } from "@/components/SocialLinks";

export default function Home() {
  const [showAllProjects, setShowAllProjects] = useState(false);
  const displayedProjects = showAllProjects ? projects : projects.slice(0, 5);

  // Prepare images for color extraction
  const imagesToExtract = useMemo(
    () => [
      ...projects.map((p) => ({ name: p.name, src: p.image })),
      { name: "boardy", src: "/work-experience-images/boardy.jpeg" },
    ],
    []
  );

  const colors = useImageColors(imagesToExtract);

  // Fetch GitHub stars for projects with github URLs
  const githubUrls = useMemo(
    () => projects.map((p) => p.github).filter(Boolean) as string[],
    []
  );
  const stars = useGitHubStars(githubUrls);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 md:py-16">
      {/* Header */}
      <header className="mb-10">
        <h1 className="mb-2 text-xl font-medium tracking-tight">
          owen gretzinger
        </h1>
      </header>

      {/* Currently / Boardy */}
      <section className="mb-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Currently
        </h2>
        <BoardyCard colors={colors["boardy"]} />
        <PreviouslySection />
      </section>

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
                colors={colors[project.name]}
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
