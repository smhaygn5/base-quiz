"use client";

import type { ReactNode } from "react";

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

const saveCopy = {
  idle: {
    title: "Save your score",
    detail: "Record this result on Base and join the global leaderboard.",
  },
  pending: {
    title: "Confirm your score",
    detail: "Approve the transaction in your wallet to finish saving.",
  },
  done: {
    title: "Score saved onchain",
    detail: "Your result is verified on Base and ready for the leaderboard.",
  },
  error: {
    title: "Save needs attention",
    detail: "Review the message below, then try the transaction again.",
  },
} as const;

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
  const saveStep = isConnected
    ? saveCopy[saveStatus]
    : {
        title: "Connect to save",
        detail: "Choose a wallet to record your score on Base.",
      };

  return (
    <section className="result-panel" aria-labelledby="result-title">
      <div className="result-panel-border" aria-hidden="true" />
      <div className="result-panel-content">
        <header className="result-hero">
          <p className="result-kicker">Round complete</p>
          <h1 id="result-title">Your final score</h1>
          <div className="result-score-row">
            <strong>{score.toLocaleString("en-US")}</strong>
            <span>points</span>
          </div>
          <div className="result-summary-pills" aria-label="Round summary">
            <span><b>{categoryName}</b> category</span>
            <span><b>{streak}</b> day streak</span>
          </div>
        </header>

        <div className="result-timeline">
          <article className="result-step is-complete">
            <div className="result-step-marker" aria-hidden="true">✓</div>
            <div className="result-step-body">
              <h2>Round completed</h2>
              <p>Five questions answered. Your final result is ready.</p>
            </div>
          </article>

          <article className="result-step is-streak">
            <div className="result-step-marker" aria-hidden="true">{streak}</div>
            <div className="result-step-body">
              <h2>Streak updated</h2>
              <p>You are now on a {streak}-day learning streak.</p>
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
              <h2>Share your result</h2>
              <p>Challenge your friends on Farcaster or X.</p>
              <div className="result-step-actions">{shareContent}</div>
            </div>
          </article>
        </div>

        <div className="result-replay">
          <p className="result-replay-kicker">Keep the momentum going</p>
          <h2>Ready for another round?</h2>
          <p>Play {categoryName} again or choose a different challenge.</p>
          <div className="result-replay-actions">
            <button type="button" className="result-button is-primary" onClick={onPlayAgain}>
              Play again <span aria-hidden="true">›</span>
            </button>
            <button type="button" className="result-button is-secondary" onClick={onChooseCategory}>
              Choose category <span aria-hidden="true">›</span>
            </button>
          </div>
          <div className="result-secondary-links">
            <button type="button" onClick={onBadges}>Streak badges</button>
            <span aria-hidden="true">·</span>
            <button type="button" onClick={onLeaderboard}>Leaderboard</button>
          </div>
        </div>
      </div>
    </section>
  );
}
