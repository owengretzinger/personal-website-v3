import { useState, useEffect } from "react";

export const useGitHubStars = (githubUrls: string[]) => {
  const [stars, setStars] = useState<Record<string, number>>({});

  useEffect(() => {
    if (githubUrls.length === 0) return;

    const fetchStars = async () => {
      try {
        const params = new URLSearchParams({
          urls: githubUrls.join(","),
        });
        const response = await fetch(`/api/github-stars?${params}`);
        if (!response.ok) return;
        const data = await response.json();
        setStars(data);
      } catch (error) {
        console.error("Error fetching GitHub stars:", error);
      }
    };

    fetchStars();
  }, [githubUrls]);

  return stars;
};
