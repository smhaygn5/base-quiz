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
    ownerAddress: "0x509549d76b75f58dfda659cfca25b234086ddd7f",
  },
  miniapp: {
    version: "1",
    name: "Base Quiz",
    subtitle: "Daily trivia quiz",
    description: "Test your crypto knowledge with 5 daily questions on Base. Build your streak, climb the onchain leaderboard, and share your score!",
    screenshotUrls: [],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#171717",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "games",
    tags: ["quiz", "trivia", "base", "crypto", "leaderboard"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Daily trivia quiz on Base",
    ogTitle: "Base Quiz: Daily Trivia",
    ogDescription: "5 daily questions, onchain leaderboard, build your streak!",
    ogImageUrl: `${ROOT_URL}/hero.png`,
  },
} as const;