import Image from "next/image";
import { generateGradient } from "@/utils/colors";
import { type Project } from "@/data/projects";
import { YouTubeIcon } from "./icons";

interface ProjectCardProps {
  project: Project;
  colors?: string[];
  stars?: number;
}

const StarIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="inline"
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export const ProjectCard = ({
  project,
  colors = [],
  stars,
}: ProjectCardProps) => {
  const mainLink = project.link || project.github;

  return (
    <div
      className="group relative flex gap-2.5 rounded-lg p-2 transition-all"
      onMouseEnter={(e) => {
        if (colors.length > 0) {
          e.currentTarget.style.background = generateGradient(colors);
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "";
      }}
    >
      <Image
        src={project.image}
        alt={project.name}
        width={28}
        height={28}
        className="h-7 w-7 rounded object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="mb-0.5 flex items-center gap-2">
          <a
            href={mainLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium"
          >
            <span className="absolute inset-0" />
            {project.name}
          </a>
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              title="Watch demo"
            >
              <YouTubeIcon className="w-3 h-3" />
            </a>
          )}
          {stars !== undefined && project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className={`relative z-10 flex items-center gap-0.5 text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 ${
                stars === 0
                  ? "opacity-0 group-hover:opacity-100 transition-opacity duration-50"
                  : ""
              }`}
            >
              <StarIcon /> {stars}
            </a>
          )}
        </div>
        <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
          {project.description}
        </p>
      </div>
    </div>
  );
};
