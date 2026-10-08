import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllArticles, getArticle } from "@/lib/articles";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const url = `https://owengretzinger.com/articles/${slug}`;
  return {
    title: `${article.title} — owen gretzinger`,
    description: article.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url,
      type: "article",
      images: article.cover
        ? [{ url: `https://owengretzinger.com${article.cover}` }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: article.cover
        ? [`https://owengretzinger.com${article.cover}`]
        : undefined,
    },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 md:px-6 py-12 md:py-16">
      <Link
        href="/"
        className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
      >
        ← back
      </Link>

      {article.cover && (
        <Image
          src={article.cover}
          alt={article.title}
          width={1376}
          height={550}
          className="mt-8 w-full h-auto rounded-lg"
          priority
        />
      )}

      <header className="mt-8 mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight mb-2">
          {article.title}
        </h1>
        <time className="text-xs text-neutral-500 dark:text-neutral-400">
          {formatDate(article.date)}
        </time>
      </header>

      <article
        className="article-prose"
        dangerouslySetInnerHTML={{ __html: article.html }}
      />

      {article.xUrl && (
        <p className="mt-12 text-xs text-neutral-500 dark:text-neutral-400">
          <a
            href={article.xUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            discuss on x →
          </a>
        </p>
      )}
    </main>
  );
}
