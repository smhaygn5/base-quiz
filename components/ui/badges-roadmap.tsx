"use client";

import type { CSSProperties, ReactNode } from "react";

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

const BADGE_COPY: Record<number, string> = {
  1: "Complete your first 3-day run",
  2: "Keep the streak alive for a week",
  3: "Build a consistent 30-day streak",
  4: "Reach the ultimate 100-day milestone",
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
  const reachedCount = badges.filter((badge) => streak >= badge.days).length;
  const progress = reachedCount <= 1 ? 0 : ((reachedCount - 1) / (badges.length - 1)) * 100;

  return (
    <section className="badges-roadmap-shell" aria-labelledby="badges-roadmap-title">
      <div className="badges-roadmap-page-heading">
        <div>
          <p>Streak NFTs · Base Mainnet</p>
          <h1 id="badges-roadmap-title">Badges</h1>
        </div>
        <button type="button" onClick={onBack}><span aria-hidden="true">←</span> Back</button>
      </div>

      <div className="badges-roadmap-card">
        <div className="badges-roadmap-card-header">
          <div>
            <h2>Streak Badge Roadmap</h2>
            <p>Keep playing, grow your streak, and claim each onchain milestone.</p>
          </div>
          <div className={`badges-roadmap-streak${connected ? " is-connected" : ""}`}>
            <span aria-hidden="true">🔥</span>
            <span>{connected ? `${streak} day streak` : "Wallet required"}</span>
          </div>
        </div>

        {!connected && (
          <div className="badges-roadmap-connect">
            <div>
              <strong>Connect to view and claim your badges</strong>
              <p>Your streak and NFT ownership are read directly from Base.</p>
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
                  <span className="badges-roadmap-days">{badge.days} days</span>
                  <div className="badges-roadmap-icon" aria-hidden="true">
                    <span>{badge.emoji}</span>
                  </div>
                  <h3>{badge.name}</h3>
                  <p>{BADGE_COPY[badge.id] || `Unlock at a ${badge.days}-day streak`}</p>

                  <div className="badges-roadmap-status">
                    {hasBadge ? (
                      <span className="badges-roadmap-owned">✓ Owned</span>
                    ) : canClaim ? (
                      <button type="button" onClick={() => onClaim(badge.id)} disabled={isClaiming}>
                        {isClaiming ? "Claiming…" : "Claim badge"}
                      </button>
                    ) : (
                      <span className="badges-roadmap-locked">
                        {connected ? `${Math.max(0, badge.days - streak)} days left` : "Locked"}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}

            {loading && (
              <div className="badges-roadmap-loading" role="status">
                <span /> Reading badges from Base…
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
