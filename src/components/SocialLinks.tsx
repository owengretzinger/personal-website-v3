import { GitHubIcon, LinkedInIcon, XIcon, EmailIcon } from "./icons";

export const SocialLinks = () => {
  return (
    <footer className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
      <div className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400">
        <span>owengretzinger on everything</span>
        <div className="flex">
          <a
            href="https://x.com/owengretzinger"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800"
            aria-label="X"
          >
            <XIcon />
          </a>
          <a
            href="https://linkedin.com/in/owengretzinger"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800"
            aria-label="LinkedIn"
          >
            <LinkedInIcon />
          </a>
          <a
            href="https://github.com/owengretzinger"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800"
            aria-label="GitHub"
          >
            <GitHubIcon />
          </a>
          <a
            href="mailto:owengretzinger@gmail.com"
            className="p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Email"
          >
            <EmailIcon />
          </a>
        </div>
      </div>
    </footer>
  );
};
