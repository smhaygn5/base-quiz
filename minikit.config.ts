const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "http://localhost:3000";

export const minikitConfig = {
  accountAssociation: {
    header: "eyJmaWQiOjExMzYwNTYsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgxMTA0N2IxZjJEQ2I3NjAwOWY2ZEZiOTRjMjA3NTY4Q2REMDRmZmVhIn0",
    payload: "eyJkb21haW4iOiJiYXNlLXF1aXotdjVpcy52ZXJjZWwuYXBwIn0",
    signature: "F977TzbtwqpOT5TWKEFGxez6gx7HYcTH10kH+Wsg3d0FSI7DGkCUvgm87RIwzZrFH9sFqgS0Pd1sZYAKvjT3CBs=",
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
    primaryCategory: "games",
    tags: ["quiz", "trivia", "base", "crypto", "leaderboard"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Daily trivia quiz on Base",
    ogTitle: "Base Quiz: Daily Trivia",
    ogDescription: "5 daily questions, onchain leaderboard, build your streak!",
    ogImageUrl: `${ROOT_URL}/hero.png`,
  },
} as const;
