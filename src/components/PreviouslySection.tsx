import { useState } from "react";
import Image from "next/image";
import { type Experience } from "@/data/experience";
import { generateGradient } from "@/utils/colors";
import { YouTubeIcon } from "./icons";

interface PreviouslySectionProps {
  experience: Experience[];
  colors?: Record<string, string[]>;
}

export const PreviouslySection = ({ experience, colors = {} }: PreviouslySectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <section className="mt-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Previously
          </h2>
          <ul className="space-y-2">
            {experience.map((exp) => (
              <li key={exp.company}>
                <div
                  className="group relative flex gap-2.5 rounded-lg p-2 transition-all"
                  onMouseEnter={(e) => {
                    const expColors = colors[exp.company];
                    if (expColors && expColors.length > 0) {
                      e.currentTarget.style.background = generateGradient(expColors);
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "";
                  }}
                >
                  <Image
                    src={exp.image}
                    alt={exp.company}
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="mb-0.5 flex items-center gap-2">
                      <a
                        href={exp.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium"
                      >
                        <span className="absolute inset-0" />
                        {exp.title}
                      </a>
                      {exp.demo && (
                        <a
                          href={exp.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative z-10 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                          title="Watch demo"
                        >
                          <YouTubeIcon className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                      {exp.company}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mt-1 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-all px-2 py-1"
      >
        {isOpen ? "hide previous" : "show previous"}
      </button>
    </>
  );
};
