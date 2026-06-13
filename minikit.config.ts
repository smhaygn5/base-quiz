const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "http://localhost:3000";

export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: "",
  },
  baseBuilder: {
    ownerAddress: "",
  },
  miniapp: {
    version: "1",
    name: "Base Quiz",
    subtitle: "Daily crypto trivia",
    description: "Test your crypto knowledge with 5 daily questions on Base. Build your streak, climb the onchain leaderboard, and share your score!",
    screenshotUrls: [],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#0a1635",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "games",
    tags: ["quiz", "trivia", "base", "crypto", "leaderboard"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Daily crypto trivia on Base",
    ogTitle: "Base Quiz - Daily Crypto Trivia",
    ogDescription: "5 daily questions, onchain leaderboard, build your streak!",
    ogImageUrl: `${ROOT_URL}/hero.png`,
  },
} as const;