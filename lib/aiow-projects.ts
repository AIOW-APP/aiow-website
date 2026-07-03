export type AiowProjectStatus = "live" | "beta" | "in_build" | "private";

export type AiowProject = {
  slug: string;
  name: string;
  status: AiowProjectStatus;
  category: "app" | "web" | "ai-tool" | "client-system";
  madeBy: "AIOW";
  headline: string;
  description: string;
  url?: string;
  launchDate?: string;
  tags: string[];
  showOnAiow: boolean;
};

export const aiowProjects: AiowProject[] = [
  {
    slug: "onetap-day",
    name: "OneTap Day",
    status: "beta",
    category: "app",
    madeBy: "AIOW",
    headline: "Concierge-first day planning beta",
    description:
      "Internal revenue-first concierge beta. Consumer app exposure belongs on Handsome.bot; AIOW.ai stays B2B/informational.",
    url: "/onetap-day",
    launchDate: "2026-05-30",
    tags: ["concierge beta", "productivity", "AI planning", "revenue test"],
    showOnAiow: false,
  },
];

export function visibleAiowProjects() {
  return aiowProjects.filter((project) => project.showOnAiow);
}
