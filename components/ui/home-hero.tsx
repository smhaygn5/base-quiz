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

  const roadmap: { done: boolean; key: string }[] = [
    { done: true, key: "launch" },
    { done: true, key: "badges" },
    { done: true, key: "categories" },
    { done: true, key: "miniapp" },
    { done: false, key: "daily" },
    { done: false, key: "seasons" },
  ];

  return (
    <>
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

    <section className="home-roadmap" aria-label={t("home.roadmap.title")}>
      <div className="home-roadmap-card">
        <div className="home-roadmap-head">
          <h2 className="home-roadmap-title">{t("home.roadmap.title")}</h2>
          <p className="home-roadmap-subtitle">{t("home.roadmap.subtitle")}</p>
        </div>
        <div className="home-roadmap-scroll">
          <div className="home-roadmap-track">
            <div className="home-roadmap-line" aria-hidden="true" />
            {roadmap.map((item) => (
              <div key={item.key} className={`home-roadmap-item${item.done ? " is-done" : ""}`}>
                <span className="home-roadmap-dot" aria-hidden="true"><span /></span>
                <span className="home-roadmap-badge">
                  {t(item.done ? "home.roadmap.shipped" : "home.roadmap.planned")}
                </span>
                <span className="home-roadmap-item-title">{t(`home.roadmap.${item.key}.title`)}</span>
                <span className="home-roadmap-item-desc">{t(`home.roadmap.${item.key}.desc`)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
