import { HomeContent } from "@/components/HomeContent";
import { projects } from "@/data/projects";
import { experience } from "@/data/experience";
import { imageColors } from "@/data/colors";
import tweetsData from "@/data/tweets.json";
import starsData from "@/data/github-stars.json";
import { type Tweet } from "@/components/TweetCard";

export default function Home() {
  const tweets = (tweetsData as Tweet[]).slice(0, 5);
  const stars = starsData as Record<string, number>;

  return (
    <HomeContent
      projects={projects}
      experience={experience}
      tweets={tweets}
      imageColors={imageColors}
      stars={stars}
    />
  );
}
