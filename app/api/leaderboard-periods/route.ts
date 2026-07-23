import { NextResponse } from "next/server";
import { CONTRACT_ADDRESS } from "@/app/contract";

export const revalidate = 60;

const BLOCKSCOUT_LOGS_URL =
  `https://base.blockscout.com/api/v2/addresses/${CONTRACT_ADDRESS}/logs`;

type BlockscoutParameter = {
  name: string;
  value: string;
};

type BlockscoutLog = {
  block_timestamp: string;
  transaction_hash: string;
  index: number;
  decoded?: {
    method_call?: string;
    parameters?: BlockscoutParameter[];
  } | null;
};

type BlockscoutResponse = {
  items?: BlockscoutLog[];
  next_page_params?: Record<string, string | number> | null;
};

type PeriodScore = {
  totalScore: number;
  bestScore: number;
};

type PeriodScores = Record<string, PeriodScore>;

function startOfUtcDay(now: Date) {
  return Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
}

function startOfUtcWeek(now: Date) {
  const dayStart = startOfUtcDay(now);
  const dayOfWeek = now.getUTCDay();
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  return dayStart - daysSinceMonday * 86_400_000;
}

function startOfUtcMonth(now: Date) {
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
}

function addScore(period: PeriodScores, address: string, score: number) {
  const key = address.toLowerCase();
  const current = period[key] || { totalScore: 0, bestScore: 0 };
  period[key] = {
    totalScore: current.totalScore + score,
    bestScore: Math.max(current.bestScore, score),
  };
}

function readParameter(log: BlockscoutLog, name: string) {
  return log.decoded?.parameters?.find((parameter) => parameter.name === name)?.value;
}

async function fetchBlockscoutPage(url: URL) {
  let lastResponse: Response | null = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    lastResponse = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate },
      signal: AbortSignal.timeout(8_000),
    });
    if (lastResponse.ok || lastResponse.status < 500) return lastResponse;
  }

  if (!lastResponse) throw new Error("Blockscout did not return a response");
  return lastResponse;
}

export async function GET() {
  const now = new Date();
  const dailyStart = startOfUtcDay(now);
  const weeklyStart = startOfUtcWeek(now);
  const monthlyStart = startOfUtcMonth(now);
  const periods = {
    daily: {} as PeriodScores,
    weekly: {} as PeriodScores,
    monthly: {} as PeriodScores,
  };

  let cursor: Record<string, string | number> | null = null;
  const seenLogs = new Set<string>();

  try {
    for (let page = 0; page < 100; page += 1) {
      const url = new URL(BLOCKSCOUT_LOGS_URL);
      if (cursor) {
        Object.entries(cursor).forEach(([key, value]) => {
          url.searchParams.set(key, String(value));
        });
      }

      const response = await fetchBlockscoutPage(url);
      if (!response.ok) {
        throw new Error(`Blockscout responded with ${response.status}`);
      }

      const payload = await response.json() as BlockscoutResponse;
      const logs = payload.items || [];
      let reachedPreviousMonth = false;

      for (const log of logs) {
        const timestamp = Date.parse(log.block_timestamp);
        if (!Number.isFinite(timestamp)) continue;
        if (timestamp < monthlyStart) {
          reachedPreviousMonth = true;
          continue;
        }
        if (!log.decoded?.method_call?.startsWith("ScoreSubmitted(")) continue;

        const identity = `${log.transaction_hash}:${log.index}`;
        if (seenLogs.has(identity)) continue;
        seenLogs.add(identity);

        const player = readParameter(log, "player");
        const score = Number(readParameter(log, "score"));
        if (!player || !Number.isFinite(score) || score < 0) continue;

        addScore(periods.monthly, player, score);
        if (timestamp >= weeklyStart) addScore(periods.weekly, player, score);
        if (timestamp >= dailyStart) addScore(periods.daily, player, score);
      }

      cursor = payload.next_page_params || null;
      if (reachedPreviousMonth || !cursor || logs.length === 0) break;
    }

    return NextResponse.json(
      {
        generatedAt: now.toISOString(),
        periods,
      },
      {
        headers: {
          "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("Period leaderboard error:", error);
    return NextResponse.json(
      { error: "Period leaderboard data is unavailable." },
      { status: 502 },
    );
  }
}
