"use client";

import type { CSSProperties } from "react";
import { useI18n } from "@/app/i18n/context";

export type LeaderboardTableRow = {
  addr: string;
  bestScore: number;
  totalScore: number;
  streak: number;
  name?: string | null;
  badgeIds: number[];
};

export type LeaderboardBadge = {
  id: number;
  name: string;
  emoji: string;
  color: string;
};

type LeaderboardTableProps = {
  rows: LeaderboardTableRow[];
  badges: LeaderboardBadge[];
  currentAddress?: string;
  loading: boolean;
  onBack: () => void;
};

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function rankLabel(index: number) {
  if (index === 0) return "1";
  if (index === 1) return "2";
  if (index === 2) return "3";
  return String(index + 1).padStart(2, "0");
}

export function LeaderboardTable({
  rows,
  badges,
  currentAddress,
  loading,
  onBack,
}: LeaderboardTableProps) {
  const { formatNumber, t } = useI18n();

  return (
    <section className="leaderboard-shell" aria-labelledby="leaderboard-title">
      <div className="leaderboard-heading">
        <div>
          <p className="leaderboard-kicker">{t("leaderboard.kicker")}</p>
          <h1 id="leaderboard-title">{t("leaderboard.title")}</h1>
          <p>{t("leaderboard.description")}</p>
        </div>
        <button type="button" className="leaderboard-back" onClick={onBack}>
          <span aria-hidden="true">←</span> {t("common.back")}
        </button>
      </div>

      <div className="leaderboard-table-frame">
        {loading ? (
          <div className="leaderboard-state">
            <span className="leaderboard-loading-dot" /> {t("leaderboard.loading")}
          </div>
        ) : rows.length === 0 ? (
          <div className="leaderboard-state">{t("leaderboard.empty")}</div>
        ) : (
          <div className="leaderboard-table-scroll">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th className="leaderboard-rank-column" scope="col">#</th>
                  <th scope="col">{t("leaderboard.player")}</th>
                  <th className="leaderboard-number-column leaderboard-total-score" scope="col">{t("leaderboard.totalScore")}</th>
                  <th className="leaderboard-number-column" scope="col">{t("leaderboard.bestScore")}</th>
                  <th className="leaderboard-number-column" scope="col">{t("leaderboard.streak")}</th>
                  <th className="leaderboard-badges-column" scope="col">{t("leaderboard.badges")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const isCurrentPlayer = currentAddress?.toLowerCase() === row.addr.toLowerCase();
                  const ownedBadges = badges.filter((badge) => row.badgeIds.includes(badge.id));
                  const playerLabel = row.name || shortAddress(row.addr);

                  return (
                    <tr key={row.addr} className={isCurrentPlayer ? "is-current-player" : undefined}>
                      <td className="leaderboard-rank-column">
                        <span className={`leaderboard-rank rank-${Math.min(index + 1, 4)}`}>
                          {rankLabel(index)}
                        </span>
                      </td>
                      <td>
                        <div className="leaderboard-player">
                          <span className="leaderboard-player-mark" aria-hidden="true">
                            {row.name ? row.name.charAt(0).toUpperCase() : "0x"}
                          </span>
                          <span className="leaderboard-player-name" title={row.name || row.addr}>
                            {playerLabel}
                          </span>
                          {isCurrentPlayer && <span className="leaderboard-you">{t("leaderboard.you")}</span>}
                        </div>
                      </td>
                      <td className="leaderboard-number-column leaderboard-total-score">
                        <strong>{formatNumber(row.totalScore)}</strong>
                      </td>
                      <td className="leaderboard-number-column">
                        <strong>{formatNumber(row.bestScore)}</strong>
                      </td>
                      <td className="leaderboard-number-column">
                        <span className="leaderboard-streak"><span aria-hidden="true">🔥</span>{row.streak}</span>
                      </td>
                      <td className="leaderboard-badges-column">
                        <div className="leaderboard-badges" aria-label={ownedBadges.length ? ownedBadges.map((badge) => badge.name).join(", ") : t("leaderboard.noBadges")}>
                          {ownedBadges.length > 0 ? ownedBadges.map((badge) => (
                            <span
                              key={badge.id}
                              className="leaderboard-badge"
                              title={t("leaderboard.badgeTitle", { name: badge.name })}
                              style={{ "--leaderboard-badge-color": badge.color } as CSSProperties}
                            >
                              <span aria-hidden="true">{badge.emoji}</span>
                            </span>
                          )) : <span className="leaderboard-no-badges">—</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="leaderboard-footer-note">
        <span>{t("leaderboard.players", { count: formatNumber(rows.length) })}</span>
        <span>{t("leaderboard.verified")}</span>
      </div>
    </section>
  );
}
