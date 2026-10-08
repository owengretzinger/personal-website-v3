import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const CONTENT_DIR = path.join(process.cwd(), "src/content/articles");

export type Article = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  cover?: string;
  xUrl?: string;
};

export type ArticleWithHtml = Article & { html: string };

marked.setOptions({ gfm: true });

export function getAllArticles(): Article[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((file) => toMeta(file))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getArticle(slug: string): ArticleWithHtml | null {
  const file = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  return {
    ...toArticle(data),
    slug,
    html: marked.parse(content) as string,
  };
}

function toMeta(file: string): Article {
  const { data } = matter(fs.readFileSync(path.join(CONTENT_DIR, file), "utf8"));
  return { ...toArticle(data), slug: file.replace(/\.md$/, "") };
}

function toArticle(data: Record<string, unknown>): Article {
  return {
    slug: String(data.slug ?? ""),
    title: String(data.title ?? ""),
    date: data.date instanceof Date
      ? data.date.toISOString().slice(0, 10)
      : String(data.date ?? ""),
    excerpt: String(data.excerpt ?? ""),
    cover: data.cover ? String(data.cover) : undefined,
    xUrl: data.xUrl ? String(data.xUrl) : undefined,
  };
}
