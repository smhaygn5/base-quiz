"use client";

import type { ReactNode } from "react";
import { useI18n } from "@/app/i18n/context";

type ResultPanelProps = {
  score: number;
  streak: number;
  categoryName: string;
  isConnected: boolean;
  saveStatus: "idle" | "pending" | "done" | "error";
  saveContent: ReactNode;
  shareContent: ReactNode;
  onPlayAgain: () => void;
  onChooseCategory: () => void;
  onBadges: () => void;
  onLeaderboard: () => void;
};

export function ResultPanel({
  score,
  streak,
  categoryName,
  isConnected,
  saveStatus,
  saveContent,
  shareContent,
  onPlayAgain,
  onChooseCategory,
  onBadges,
  onLeaderboard,
}: ResultPanelProps) {
  const { formatNumber, t } = useI18n();
  const saveStep = isConnected
    ? {
        title: t(`result.save.${saveStatus}.title`),
        detail: t(`result.save.${saveStatus}.detail`),
      }
    : {
        title: t("result.save.disconnected.title"),
        detail: t("result.save.disconnected.detail"),
      };

  return (
    <section className="result-panel" aria-labelledby="result-title">
      <div className="result-panel-border" aria-hidden="true" />
      <div className="result-panel-content">
        <header className="result-hero">
          <p className="result-kicker">{t("result.roundComplete")}</p>
          <h1 id="result-title">{t("result.finalScore")}</h1>
          <div className="result-score-row">
            <strong>{formatNumber(score)}</strong>
            <span>{t("result.points")}</span>
          </div>
          <div className="result-summary-pills" aria-label={t("result.summaryAria")}>
            <span>{t("result.categoryPill", { category: categoryName })}</span>
            <span>{t("result.streakPill", { count: streak })}</span>
          </div>
        </header>

        <div className="result-timeline">
          <article className="result-step is-complete">
            <div className="result-step-marker" aria-hidden="true">✓</div>
            <div className="result-step-body">
              <h2>{t("result.roundCompletedTitle")}</h2>
              <p>{t("result.roundCompletedDetail")}</p>
            </div>
          </article>

          <article className="result-step is-streak">
            <div className="result-step-marker" aria-hidden="true">{streak}</div>
            <div className="result-step-body">
              <h2>{t("result.streakUpdatedTitle")}</h2>
              <p>{t("result.streakUpdatedDetail", { count: streak })}</p>
            </div>
          </article>

          <article className={`result-step is-save is-${saveStatus}`}>
            <div className="result-step-marker" aria-hidden="true">B</div>
            <div className="result-step-body">
              <h2>{saveStep.title}</h2>
              <p>{saveStep.detail}</p>
              <div className="result-step-actions">{saveContent}</div>
            </div>
          </article>

          <article className="result-step is-share is-last">
            <div className="result-step-marker" aria-hidden="true">↗</div>
            <div className="result-step-body">
              <h2>{t("result.shareTitle")}</h2>
              <p>{t("result.shareDetail")}</p>
              <div className="result-step-actions">{shareContent}</div>
            </div>
          </article>
        </div>

        <div className="result-replay">
          <p className="result-replay-kicker">{t("result.replayKicker")}</p>
          <h2>{t("result.replayTitle")}</h2>
          <p>{t("result.replayDetail", { category: categoryName })}</p>
          <div className="result-replay-actions">
            <button type="button" className="result-button is-primary" onClick={onPlayAgain}>
              {t("result.playAgain")} <span aria-hidden="true">›</span>
            </button>
            <button type="button" className="result-button is-secondary" onClick={onChooseCategory}>
              {t("result.chooseCategory")} <span aria-hidden="true">›</span>
            </button>
          </div>
          <div className="result-secondary-links">
            <button type="button" onClick={onBadges}>{t("home.streakBadges")}</button>
            <span aria-hidden="true">·</span>
            <button type="button" onClick={onLeaderboard}>{t("home.leaderboard")}</button>
          </div>
        </div>
      </div>
    </section>
  );
}
