import Image from "next/image";
import { type Experience } from "@/data/experience";
import { generateGradient } from "@/utils/colors";

interface CurrentExperienceCardProps {
  experience: Experience;
  colors?: string[];
  isActive?: boolean;
}

export const CurrentExperienceCard = ({ experience, colors = [], isActive = false }: CurrentExperienceCardProps) => {
  const gradient = colors.length > 0 ? generateGradient(colors) : undefined;

  return (
    <a
      href={experience.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-2.5 rounded-lg p-2 transition-all"
      style={isActive && gradient ? { background: gradient } : undefined}
      onMouseEnter={(e) => {
        if (gradient) {
          e.currentTarget.style.background = gradient;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "";
        }
      }}
    >
      <Image
        src={experience.image}
        alt={experience.company}
        width={28}
        height={28}
        className="h-7 w-7 rounded object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="mb-0.5 text-sm font-medium">{experience.title}</div>
        <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
          {experience.company}
        </p>
      </div>
    </a>
  );
};
