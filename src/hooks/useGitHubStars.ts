import starsData from "@/data/github-stars.json";

export const useGitHubStars = (_githubUrls: string[]) => {
  return starsData as Record<string, number>;
};
