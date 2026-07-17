"use client";

import Image from "next/image";
import { useI18n } from "@/app/i18n/context";

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
  const { t } = useI18n();

  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div className="home-hero-grid" aria-hidden="true" />

      <div className="home-hero-content">
        <div className="home-hero-mark" aria-hidden="true">
          <div className="home-hero-mark-glow" />
          <Image src="/favicon.svg" alt="" width={590} height={550} priority />
        </div>

        <p className="home-hero-kicker">
          <span /> {t("home.kicker")}
        </p>

        <h1 id="home-hero-title" className="home-hero-title">
          <span>{t("home.titleLine1")}</span>
          <span className="home-hero-title-accent">{t("home.titleLine2")}</span>
        </h1>

        <p className="home-hero-description">
          {t("home.description")}
        </p>

        {streak > 0 && (
          <div className="home-hero-streak">
            <span aria-hidden="true">🔥</span>
            {t("home.streak", { count: streak })}
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
            <span>{startPending ? t("home.confirmWallet") : t("home.startRound")}</span>
            <span aria-hidden="true">{startPending ? "·" : "→"}</span>
          </button>
          <button type="button" className="home-hero-secondary" onClick={onLeaderboard}>
            {t("home.leaderboard")}
          </button>
          <button type="button" className="home-hero-secondary" onClick={onBadges}>
            {t("home.streakBadges")}
          </button>
        </div>

        {startError && (
          <p className="home-hero-start-error" role="alert">
            {startError}
          </p>
        )}

        <p className="home-hero-facts">{t("home.facts")}</p>
      </div>
    </section>
  );
}
