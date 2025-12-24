export type Experience = {
  title: string;
  company: string;
  image: string;
  link?: string;
  demo?: string;
};

export const experience: Experience[] = [
  {
    title: "founding engineer",
    company: "boardy",
    image: "/work-experience-images/boardy.png",
    link: "https://boardy.ai",
  },
  {
    title: "computer science",
    company: "mcmaster university",
    image: "/work-experience-images/mcmaster.webp",
    link: "https://www.linkedin.com/posts/owengretzinger_i-graduated-from-computer-science-at-mcmaster-activity-7341495485838307329-kZtG",
  },
  {
    title: "software developer",
    company: "rbc amplify",
    image: "/work-experience-images/rbc.webp",
    link: "https://www.linkedin.com/posts/owengretzinger_extremely-grateful-for-my-co-op-with-rbc-activity-7232802078413189125-5rTx",
  },
  {
    title: "software developer",
    company: "mcmaster engineering society",
    image: "/work-experience-images/mes.png",
    link: "https://www.linkedin.com/feed/update/urn:li:ugcPost:7307448936787574787",
    demo: "https://www.linkedin.com/feed/update/urn:li:ugcPost:7307448936787574787",
  },
  {
    title: "technical executive",
    company: "deltahacks",
    image: "/work-experience-images/deltahacks.png",
    link: "https://www.linkedin.com/posts/owengretzinger_i-joined-the-deltahacks-team-as-a-technical-activity-7255764086712365056-fV_B",
  },
  {
    title: "software developer",
    company: "arctic wolf",
    image: "/work-experience-images/aw.webp",
    link: "https://www.linkedin.com/posts/owengretzinger_jointhepack-activity-7099119472917053440-Clc0",
  },
];
