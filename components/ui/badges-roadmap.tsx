"use client";

import type { CSSProperties, ReactNode } from "react";
import { useI18n } from "@/app/i18n/context";

export type BadgeMilestone = {
  id: number;
  name: string;
  emoji: string;
  days: number;
  color: string;
};

type BadgesRoadmapProps = {
  badges: BadgeMilestone[];
  connected: boolean;
  loading: boolean;
  streak: number;
  owned: boolean[];
  claimingId: number | null;
  error: string;
  connectSlot?: ReactNode;
  onClaim: (badgeId: number) => void;
  onBack: () => void;
};

export function BadgesRoadmap({
  badges,
  connected,
  loading,
  streak,
  owned,
  claimingId,
  error,
  connectSlot,
  onClaim,
  onBack,
}: BadgesRoadmapProps) {
  const { t } = useI18n();
  const reachedCount = badges.filter((badge) => streak >= badge.days).length;
  const progress = reachedCount <= 1 ? 0 : ((reachedCount - 1) / (badges.length - 1)) * 100;

  return (
    <section className="badges-roadmap-shell" aria-labelledby="badges-roadmap-title">
      <div className="badges-roadmap-page-heading">
        <div>
          <p>{t("badges.kicker")}</p>
          <h1 id="badges-roadmap-title">{t("badges.title")}</h1>
        </div>
        <button type="button" onClick={onBack}><span aria-hidden="true">←</span> {t("common.back")}</button>
      </div>

      <div className="badges-roadmap-card">
        <div className="badges-roadmap-card-header">
          <div>
            <h2>{t("badges.roadmapTitle")}</h2>
            <p>{t("badges.roadmapDescription")}</p>
          </div>
          <div className={`badges-roadmap-streak${connected ? " is-connected" : ""}`}>
            <span aria-hidden="true">🔥</span>
            <span>{connected ? t("badges.streak", { count: streak }) : t("badges.walletRequired")}</span>
          </div>
        </div>

        {!connected && (
          <div className="badges-roadmap-connect">
            <div>
              <strong>{t("badges.connectTitle")}</strong>
              <p>{t("badges.connectDetail")}</p>
            </div>
            {connectSlot}
          </div>
        )}

        {error && <p className="badges-roadmap-error">{error}</p>}

        <div className={`badges-roadmap-scroll${!connected ? " is-disconnected" : ""}`}>
          <div className="badges-roadmap-timeline">
            <div className="badges-roadmap-line" aria-hidden="true">
              <span style={{ width: `${progress}%` }} />
            </div>

            {badges.map((badge, index) => {
              const hasBadge = connected && Boolean(owned[index]);
              const canClaim = connected && !hasBadge && streak >= badge.days;
              const isClaiming = claimingId === badge.id;
              const state = hasBadge ? "owned" : canClaim ? "claimable" : "locked";

              return (
                <article
                  key={badge.id}
                  className={`badges-roadmap-item is-${state}`}
                  style={{ "--badge-roadmap-color": badge.color } as CSSProperties}
                >
                  <span className="badges-roadmap-dot" aria-hidden="true"><i /></span>
                  <span className="badges-roadmap-days">{t("badges.days", { count: badge.days })}</span>
                  <div className="badges-roadmap-icon" aria-hidden="true">
                    <span>{badge.emoji}</span>
                  </div>
                  <h3>{badge.name}</h3>
                  <p>{t(
                    badge.id === 1
                      ? "badges.bronze.description"
                      : badge.id === 2
                        ? "badges.silver.description"
                        : badge.id === 3
                          ? "badges.gold.description"
                          : badge.id === 4
                            ? "badges.diamond.description"
                            : "badges.unlock",
                    { count: badge.days },
                  )}</p>

                  <div className="badges-roadmap-status">
                    {hasBadge ? (
                      <span className="badges-roadmap-owned">✓ {t("badges.owned")}</span>
                    ) : canClaim ? (
                      <button type="button" onClick={() => onClaim(badge.id)} disabled={isClaiming}>
                        {isClaiming ? t("badges.claiming") : t("badges.claim")}
                      </button>
                    ) : (
                      <span className="badges-roadmap-locked">
                        {connected
                          ? t("badges.daysLeft", { count: Math.max(0, badge.days - streak) })
                          : t("badges.locked")}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}

            {loading && (
              <div className="badges-roadmap-loading" role="status">
                <span /> {t("badges.loading")}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
