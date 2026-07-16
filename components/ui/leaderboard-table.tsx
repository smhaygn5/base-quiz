"use client";

import type { CSSProperties } from "react";

export type LeaderboardTableRow = {
  addr: string;
  bestScore: number;
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
  return (
    <section className="leaderboard-shell" aria-labelledby="leaderboard-title">
      <div className="leaderboard-heading">
        <div>
          <p className="leaderboard-kicker">Base Mainnet · All time</p>
          <h1 id="leaderboard-title">Leaderboard</h1>
          <p>Top players ranked by their best onchain score.</p>
        </div>
        <button type="button" className="leaderboard-back" onClick={onBack}>
          <span aria-hidden="true">←</span> Back
        </button>
      </div>

      <div className="leaderboard-table-frame">
        {loading ? (
          <div className="leaderboard-state">
            <span className="leaderboard-loading-dot" /> Reading scores from Base…
          </div>
        ) : rows.length === 0 ? (
          <div className="leaderboard-state">No scores yet. Be the first player on the board.</div>
        ) : (
          <div className="leaderboard-table-scroll">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th className="leaderboard-rank-column" scope="col">#</th>
                  <th scope="col">Player</th>
                  <th className="leaderboard-number-column" scope="col">Best score</th>
                  <th className="leaderboard-number-column" scope="col">Streak</th>
                  <th className="leaderboard-badges-column" scope="col">Badges</th>
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
                          {isCurrentPlayer && <span className="leaderboard-you">You</span>}
                        </div>
                      </td>
                      <td className="leaderboard-number-column">
                        <strong>{row.bestScore.toLocaleString("en-US")}</strong>
                      </td>
                      <td className="leaderboard-number-column">
                        <span className="leaderboard-streak"><span aria-hidden="true">🔥</span>{row.streak}</span>
                      </td>
                      <td className="leaderboard-badges-column">
                        <div className="leaderboard-badges" aria-label={ownedBadges.length ? ownedBadges.map((badge) => badge.name).join(", ") : "No badges"}>
                          {ownedBadges.length > 0 ? ownedBadges.map((badge) => (
                            <span
                              key={badge.id}
                              className="leaderboard-badge"
                              title={`${badge.name} badge`}
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
        <span>{rows.length} players</span>
        <span>Scores and badges verified onchain</span>
      </div>
    </section>
  );
}
