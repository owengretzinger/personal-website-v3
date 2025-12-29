import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
});

const siteUrl = "https://owengretzinger.com";
const title = "owen gretzinger";
const description =
  "owen gretzinger, founding engineer at boardy: view my work, projects, social links, and more";

export const metadata: Metadata = {
  title,
  description,
  keywords:
    "Owen Gretzinger, Boardy, Founding Engineer, Software Engineer, McMaster University, RBC Amplify, DeltaHacks, Arctic Wolf, Open Source, AI, Meetingbot, Meetingnotes, Gitreadme",
  creator: "Owen Gretzinger",
  authors: [{ name: "Owen Gretzinger" }],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "Owen Gretzinger",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@owengretzinger",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Owen Gretzinger",
  url: siteUrl,
  image: `${siteUrl}/pfp.png`,
  jobTitle: "Founding Engineer",
  worksFor: {
    "@type": "Organization",
    name: "Boardy",
  },
  sameAs: [
    "https://github.com/owengretzinger",
    "https://linkedin.com/in/owengretzinger",
    "https://x.com/owengretzinger",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={bricolage.variable}>
      <body className="antialiased bg-white dark:bg-neutral-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
