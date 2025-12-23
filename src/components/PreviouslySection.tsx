import { useState } from "react";
import Image from "next/image";
import { previousExperience } from "@/data/experience";

export const PreviouslySection = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <section className="mt-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Previously
          </h2>
          <ul className="space-y-2">
            {previousExperience.map((exp) => (
              <li key={exp.company} className="flex gap-2.5 rounded-lg p-2">
                <Image
                  src={exp.image}
                  alt={exp.company}
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="mb-0.5 text-sm font-medium">{exp.title}</div>
                  <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {exp.company}
                  </p>
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
