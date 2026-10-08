import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articles";

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles().map((a) => ({
    url: `https://owengretzinger.com/articles/${a.slug}`,
    lastModified: new Date(a.date),
    changeFrequency: "yearly" as const,
    priority: 0.8,
  }));
  return [
    {
      url: "https://owengretzinger.com",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...articles,
  ];
}
