import Image from "next/image";
import { generateGradient } from "@/utils/colors";

interface BoardyCardProps {
  colors?: string[];
}

export const BoardyCard = ({ colors = [] }: BoardyCardProps) => {
  return (
    <a
      href="https://boardy.ai"
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-2.5 rounded-lg p-2 transition-all"
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
        src="/work-experience-images/boardy.jpeg"
        alt="Boardy"
        width={28}
        height={28}
        className="h-7 w-7 rounded object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="mb-0.5 text-sm font-medium">founding engineer</div>
        <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
          boardy
        </p>
      </div>
    </a>
  );
};
