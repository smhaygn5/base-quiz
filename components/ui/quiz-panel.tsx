"use client";

import { useI18n } from "@/app/i18n/context";

type QuizPanelProps = {
  categoryName: string;
  categoryEmoji: string;
  currentIndex: number;
  totalQuestions: number;
  score: number;
  timeLeft: number;
  question: string;
  options: string[];
  correctIndex: number;
  selectedIndex: number | null;
  onAnswer: (answerIndex: number) => void;
};

export function QuizPanel({
  categoryName,
  categoryEmoji,
  currentIndex,
  totalQuestions,
  score,
  timeLeft,
  question,
  options,
  correctIndex,
  selectedIndex,
  onAnswer,
}: QuizPanelProps) {
  const { formatNumber, t } = useI18n();
  const answeredCount = currentIndex + (selectedIndex !== null ? 1 : 0);
  const progress = (answeredCount / totalQuestions) * 100;
  const isCorrectAnswer = selectedIndex === correctIndex;

  return (
    <section className="quiz-panel" aria-labelledby="quiz-question-title">
      <div className="quiz-panel-topline">
        <div>
          <p className="quiz-panel-category">{categoryEmoji} {categoryName}</p>
          <strong>{t("quiz.questionProgress", { current: currentIndex + 1, total: totalQuestions })}</strong>
        </div>
        <div className="quiz-panel-stats">
          <span>{t("quiz.score")} <strong>{formatNumber(score)}</strong></span>
          <span className={timeLeft <= 3 ? "is-urgent" : undefined}>{t("quiz.time")} <strong>{String(timeLeft).padStart(2, "0")}s</strong></span>
        </div>
      </div>

      <div className="quiz-steps" aria-label={t("quiz.answeredAria", { answered: answeredCount, total: totalQuestions })}>
        {Array.from({ length: totalQuestions }, (_, index) => {
          const isAnswered = index < currentIndex || (index === currentIndex && selectedIndex !== null);
          const isCurrent = index === currentIndex && selectedIndex === null;
          const answerState = index === currentIndex && selectedIndex !== null
            ? isCorrectAnswer ? " is-correct" : " is-wrong"
            : "";

          return (
            <div
              key={index}
              className={`quiz-step${isAnswered ? " is-answered" : ""}${isCurrent ? " is-current" : ""}${answerState}`}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span>{index + 1}</span>
            </div>
          );
        })}
      </div>

      <div className="quiz-progress-bar" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="quiz-question-block">
        <p>{t("quiz.chooseCorrect")}</p>
        <h1 id="quiz-question-title">{question}</h1>
      </div>

      {selectedIndex !== null && (
        <div className={`quiz-feedback${isCorrectAnswer ? " is-correct" : " is-wrong"}`} role="status" aria-live="polite">
          <span aria-hidden="true">{isCorrectAnswer ? "✓" : "×"}</span>
          <div>
            <strong>{isCorrectAnswer ? t("quiz.correct") : t("quiz.wrong")}</strong>
            <p>{isCorrectAnswer
              ? t("quiz.points", { points: formatNumber(100 + timeLeft * 10) })
              : t("quiz.correctOption", { option: String.fromCharCode(65 + correctIndex) })}</p>
          </div>
        </div>
      )}

      <div className="quiz-options">
        {options.map((option, index) => {
          const isCorrect = index === correctIndex;
          const isSelected = index === selectedIndex;
          const showResult = selectedIndex !== null;
          const stateClass = showResult
            ? isCorrect
              ? " is-correct"
              : isSelected
                ? " is-wrong"
                : " is-muted"
            : "";

          return (
            <button
              type="button"
              key={index}
              className={`quiz-option${stateClass}`}
              onClick={() => onAnswer(index)}
              disabled={showResult}
              aria-pressed={isSelected}
            >
              <span className="quiz-option-key">{String.fromCharCode(65 + index)}</span>
              <span className="quiz-option-label">{option}</span>
              {showResult && (isCorrect || isSelected) && (
                <span className="quiz-option-result" aria-hidden="true">{isCorrect ? "✓" : "×"}</span>
              )}
            </button>
          );
        })}
      </div>

      <p className="quiz-auto-note">{t("quiz.autoNote")}</p>
    </section>
  );
}
