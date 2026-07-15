import { NextResponse } from "next/server";

const BADGES = {
  1: {
    name: "Base Quiz Bronze Badge",
    description: "Awarded for maintaining a 3-day onchain Base Quiz streak.",
    image: "bronze.svg",
    tier: "Bronze",
    streak: 3,
  },
  2: {
    name: "Base Quiz Silver Badge",
    description: "Awarded for maintaining a 7-day onchain Base Quiz streak.",
    image: "silver.svg",
    tier: "Silver",
    streak: 7,
  },
  3: {
    name: "Base Quiz Gold Badge",
    description: "Awarded for maintaining a 30-day onchain Base Quiz streak.",
    image: "gold.svg",
    tier: "Gold",
    streak: 30,
  },
  4: {
    name: "Base Quiz Diamond Badge",
    description: "Awarded for maintaining a 100-day onchain Base Quiz streak.",
    image: "diamond.svg",
    tier: "Diamond",
    streak: 100,
  },
} as const;

type BadgeId = keyof typeof BADGES;

function parseBadgeId(value: string): BadgeId | null {
  const rawId = value.toLowerCase().replace(/\.json$/, "");

  try {
    const id = /^[0-9a-f]{64}$/.test(rawId)
      ? Number(BigInt(`0x${rawId}`))
      : /^\d+$/.test(rawId)
        ? Number(rawId)
        : Number.NaN;

    return id >= 1 && id <= 4 ? (id as BadgeId) : null;
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const id = parseBadgeId(rawId);

  if (id === null) {
    return NextResponse.json(
      { error: "Badge not found" },
      { status: 404, headers: { "Cache-Control": "public, max-age=300" } },
    );
  }

  const badge = BADGES[id];
  const origin = new URL(request.url).origin;

  return NextResponse.json(
    {
      name: badge.name,
      description: badge.description,
      image: `${origin}/badges/${badge.image}`,
      external_url: origin,
      attributes: [
        { trait_type: "Tier", value: badge.tier },
        { trait_type: "Required Streak", value: badge.streak },
        { trait_type: "Network", value: "Base" },
      ],
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
