"use client";

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
  const answeredCount = currentIndex + (selectedIndex !== null ? 1 : 0);
  const progress = (answeredCount / totalQuestions) * 100;
  const isCorrectAnswer = selectedIndex === correctIndex;

  return (
    <section className="quiz-panel" aria-labelledby="quiz-question-title">
      <div className="quiz-panel-topline">
        <div>
          <p className="quiz-panel-category">{categoryEmoji} {categoryName}</p>
          <strong>Question {currentIndex + 1} of {totalQuestions}</strong>
        </div>
        <div className="quiz-panel-stats">
          <span>Score <strong>{score.toLocaleString("en-US")}</strong></span>
          <span className={timeLeft <= 3 ? "is-urgent" : undefined}>Time <strong>{String(timeLeft).padStart(2, "0")}s</strong></span>
        </div>
      </div>

      <div className="quiz-steps" aria-label={`${answeredCount} of ${totalQuestions} questions answered`}>
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
        <p>Choose the correct answer</p>
        <h1 id="quiz-question-title">{question}</h1>
      </div>

      {selectedIndex !== null && (
        <div className={`quiz-feedback${isCorrectAnswer ? " is-correct" : " is-wrong"}`} role="status" aria-live="polite">
          <span aria-hidden="true">{isCorrectAnswer ? "✓" : "×"}</span>
          <div>
            <strong>{isCorrectAnswer ? "Correct answer" : "Wrong answer"}</strong>
            <p>{isCorrectAnswer ? `+${100 + timeLeft * 10} points` : `Correct option: ${String.fromCharCode(65 + correctIndex)}`}</p>
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

      <p className="quiz-auto-note">Answer once · next question loads automatically</p>
    </section>
  );
}
