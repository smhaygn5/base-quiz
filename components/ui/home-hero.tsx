"use client";

import Image from "next/image";

type HomeHeroProps = {
  streak: number;
  onStart: () => void;
  startPending?: boolean;
  startError?: string;
  onLeaderboard: () => void;
  onBadges: () => void;
};

export function HomeHero({
  streak,
  onStart,
  startPending = false,
  startError = "",
  onLeaderboard,
  onBadges,
}: HomeHeroProps) {
  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div className="home-hero-grid" aria-hidden="true" />

      <div className="home-hero-content">
        <div className="home-hero-mark" aria-hidden="true">
          <div className="home-hero-mark-glow" />
          <Image src="/favicon.svg" alt="" width={590} height={550} priority />
        </div>

        <p className="home-hero-kicker">
          <span /> Onchain trivia · Base
        </p>

        <h1 id="home-hero-title" className="home-hero-title">
          <span>Daily trivia.</span>
          <span className="home-hero-title-accent">Built on Base.</span>
        </h1>

        <p className="home-hero-description">
          Pick a category, answer five questions, and race the clock. Build your streak,
          save your score onchain, and climb the global leaderboard.
        </p>

        {streak > 0 && (
          <div className="home-hero-streak">
            <span aria-hidden="true">🔥</span>
            {streak}-day streak
          </div>
        )}

        <div className="home-hero-actions">
          <button
            type="button"
            className="home-hero-start"
            onClick={onStart}
            disabled={startPending}
            aria-busy={startPending}
          >
            <span>{startPending ? "Confirm in wallet…" : "Start round"}</span>
            <span aria-hidden="true">{startPending ? "·" : "→"}</span>
          </button>
          <button type="button" className="home-hero-secondary" onClick={onLeaderboard}>
            Leaderboard
          </button>
          <button type="button" className="home-hero-secondary" onClick={onBadges}>
            Streak badges
          </button>
        </div>

        {startError && (
          <p className="home-hero-start-error" role="alert">
            {startError}
          </p>
        )}

        <p className="home-hero-facts">5 questions · 15 seconds each · scores saved onchain</p>
      </div>
    </section>
  );
}
