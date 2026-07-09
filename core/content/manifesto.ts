// AIOW L4 Manifesto — English source copy
// Author: Debbie (draft 1), 2026-04-21. Richard edits later.
// Tone rules: no "revolutionary / seamless / next-gen". Statements, not pitches.

export const manifestoHero = {
  eyebrow: "AIOW · Team Handsome",
  // Max 8 words. Three variants — Richard picks one.
  headlineVariants: [
    "Six projects. One intelligence. Built in public.",
    "An operating system for the work we do.",
    "We build infrastructure. The rest is commentary.",
  ],
  headline: "Six projects. One intelligence. Built in public.",
  // Max 20 words.
  sub: "AIOW is the orchestration layer Team Handsome runs on. On-chain, opinionated, and shipping since 2026.",
  cta: { label: "Read the manifesto", href: "#manifesto" },
  // Secondary link, optional.
  ctaSecondary: { label: "See what Debbie is doing", href: "#debbie" },
} as const;

export const manifestoPrinciples = [
  {
    n: "01",
    title: "Systems over ideas.",
    body: "A demo is a promise. Infrastructure is a track record. We build the second thing.",
  },
  {
    n: "02",
    title: "Context before action.",
    body: "A tool that knows less is a tool that breaks more. Our agents read the room before they touch the keyboard.",
  },
  {
    n: "03",
    title: "Autonomy over control.",
    body: "Humans set direction. Agents do the work. If we are the bottleneck, we did not build it right.",
  },
  {
    n: "04",
    title: "Long game over shipped-fast.",
    body: "We accept delays for a stronger end result. Compounding beats moving fast and apologising later.",
  },
  {
    n: "05",
    title: "On-chain where it matters.",
    body: "Ownership, not hype. $AIOW is how the team, the builders, and the holders stay aligned. That is the only reason it exists.",
  },
] as const;

// 6-8 example events for the live Debbie tile (rotate every 8s).
// Structure mirrors events.jsonl: { ts, kind, subject, result }.
export const debbieEventsMock = [
  {
    ts: "13:54",
    kind: "project_deploy",
    subject: "aiow-website",
    result: "live · sha 4f3c1b2",
  },
  {
    ts: "13:47",
    kind: "heartbeat",
    subject: "w3lp-backtest",
    result: "142 trades · 61% win",
  },
  {
    ts: "13:31",
    kind: "subagent_done",
    subject: "quality-sweep",
    result: "4 registries scanned",
  },
  {
    ts: "13:18",
    kind: "treasury",
    subject: "$AIOW fees",
    result: "3.5% routed · 60% burn, 40% treasury",
  },
  {
    ts: "12:59",
    kind: "scan_result",
    subject: "h3alth-biomarker",
    result: "24 samples ingested",
  },
  {
    ts: "12:44",
    kind: "router_decision",
    subject: "build lane",
    result: "glm-5.1 → primary, 382GB warm",
  },
  {
    ts: "12:21",
    kind: "estate_sync",
    subject: "Handsome Plaza (52,52)",
    result: "on-chain verified",
  },
  {
    ts: "11:58",
    kind: "tisnix_alert",
    subject: "ops intelligence",
    result: "2 anomalies flagged",
  },
] as const;

export const debbieTileCopy = {
  eyebrow: "· Debbie · live",
  title: "What the OS is doing right now.",
  sub: "A sampled feed from Debbie — the router that runs Team Handsome. Scrubbed of private data, refreshed every 8 seconds.",
} as const;

export const projectsCopy = {
  eyebrow: "· The six",
  title: "One ecosystem. Six surfaces.",
  sub: "Each one solves its own problem. Each one reports back to the same intelligence layer.",
  items: [
    {
      emoji: "🧠",
      name: "AIOW",
      oneliner: "Central intelligence. The operating system.",
      status: "live",
    },
    {
      emoji: "⚙️",
      name: "W3LP",
      oneliner: "No-code value factory. Tokens, NFTs, launches.",
      status: "live",
    },
    {
      emoji: "🦎",
      name: "Spunky",
      oneliner: "Community equity and alignment. Mascot-grade.",
      status: "live",
    },
    {
      emoji: "❤️‍🔥",
      name: "H3ALTH",
      oneliner: "Digital life partner. Brain AI for the body.",
      status: "building",
    },
    {
      emoji: "📡",
      name: "TISNIX",
      oneliner: "B2B operational intelligence. Quietly ruthless.",
      status: "building",
    },
    {
      emoji: "🚚",
      name: "Cargo Donkey",
      oneliner: "Physical reality and cashflow. Logistics, unglamorous.",
      status: "concept",
    },
  ],
} as const;

export const technicalCopy = {
  eyebrow: "· For the people who read the source",
  title: "How the machine works.",
  sub: "Enough detail to know it is not vapour. Not enough to bore the rest.",
  blocks: [
    {
      label: "Token",
      value: "D5kbasLi848K3krRoaTQrtRYpCwYoJStoY8AaRQnr6e7",
      note: "$AIOW · Solana · 10B supply · fixed",
    },
    {
      label: "Program",
      value: "AhbvLiWLh5Ze8kaT9VTZ449qJo8UctxyJ4quPGm56wSc",
      note: "On-chain economy · 3.5% fee · 60/40 burn/treasury",
    },
    {
      label: "Orchestration",
      value: "Debbie Router · super-hybrid lanes",
      note: "6 lanes · local-first · cloud as fallback · MLX + Ollama + OpenRouter",
    },
    {
      label: "Estate",
      value: "Handsome Plaza (52, 52)",
      note: "600,000 $AIOW locked · on-chain verified",
    },
  ],
} as const;

type CtaLink = { label: string; href: string; external: boolean; note?: string };
export const footerCta: { eyebrow: string; title: string; sub: string; links: CtaLink[]; closer: string } = {
  eyebrow: "· Next",
  title: "You can come in, or you can watch.",
  sub: "Both are fine. Neither is free.",
  // Richard picks which of these ship.
  links: [
    { label: "Hold $AIOW", href: "https://jup.ag/swap/SOL-D5kbasLi848K3krRoaTQrtRYpCwYoJStoY8AaRQnr6e7", external: true },
    { label: "Read the whitepaper", href: "/whitepaper", external: false, note: "coming soon" },
    { label: "Join the Telegram", href: "https://t.me/aiowproject", external: true, note: "verify URL" },
    { label: "Follow @handsomebstrd", href: "https://x.com/handsomebstrd", external: true },
    { label: "Email", href: "mailto:contact@aiow.io", external: false },
  ],
  closer: "© 2026 AIOW BV · Amsterdam · Built in public since 2026.",
} as const;
