import * as fs from "fs";
import * as path from "path";

// Parse owner/repo from GitHub URL
const parseGitHubUrl = (url: string) => {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
};

// Fetch stars for a single repo
const fetchRepoStars = async (
  owner: string,
  repo: string
): Promise<number | null> => {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          ...(process.env.GITHUB_TOKEN && {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          }),
        },
      }
    );
    if (!response.ok) {
      console.error(`Failed to fetch ${owner}/${repo}: ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data.stargazers_count;
  } catch (error) {
    console.error(`Error fetching ${owner}/${repo}:`, error);
    return null;
  }
};

async function main() {
  console.log("Fetching GitHub stars...");

  // Import projects
  const { projects } = await import("../src/data/projects");

  const githubUrls = projects
    .map((p) => p.github)
    .filter((url): url is string => !!url);

  const starCounts: Record<string, number> = {};

  // Fetch in parallel but with some rate limiting
  const results = await Promise.all(
    githubUrls.map(async (url) => {
      const parsed = parseGitHubUrl(url);
      if (!parsed) return { url, count: null };

      const count = await fetchRepoStars(parsed.owner, parsed.repo);
      return { url, count };
    })
  );

  for (const { url, count } of results) {
    if (count !== null) {
      starCounts[url] = count;
      console.log(`  ${url}: ${count} stars`);
    }
  }

  const outputPath = path.join(process.cwd(), "src/data/github-stars.json");

  if (Object.keys(starCounts).length > 0) {
    fs.writeFileSync(outputPath, JSON.stringify(starCounts, null, 2));
    console.log(`\nSaved ${Object.keys(starCounts).length} repo star counts to ${outputPath}`);
  } else {
    // Keep existing file if fetch failed
    if (fs.existsSync(outputPath)) {
      console.log("Fetch returned no data, keeping existing file");
    } else {
      fs.writeFileSync(outputPath, "{}");
      console.log("No stars fetched, created empty file");
    }
  }
}

main();
