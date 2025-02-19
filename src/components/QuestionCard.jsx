import React from "react";

/**
 * QuestionCard
 * 
 * Props:
 * - currentCard: the question object, e.g. { topic, question, a, b, c, d, correctAnswer, explanation, difficulty }
 * - showAnswer: boolean - whether the answer/explanation is revealed
 * - setShowAnswer: function - toggles the reveal
 * - updateDifficulty: function - (newDifficulty) => void (mark easy/hard)
 * - handleNavigation: function - (step: number) => void (like next/previous)
 * - isDeckEmpty: boolean - for safety checks
 */
export default function QuestionCard({
  currentCard,
  isDeckEmpty,
  showAnswer,
  setShowAnswer,
  handleChoiceClick,
  updateDifficulty,
  handleNavigation,
  renderKey,
}) {
  if (isDeckEmpty || !currentCard) {
    return <div className="alert alert-danger">No questions available!</div>;
  }

  return (
    <div className="card p-3 mb-3" key={renderKey}>
      <h4 className="card-title">{currentCard.topic}</h4>
      <p className="card-text">{currentCard.question}</p>

      <div className="mb-3">
        {["a", "b", "c", "d"].map((choice) =>
          currentCard[choice] ? (
            <button
              key={choice}
              className="btn btn-outline-primary me-2 mb-2"
              onClick={(e) => handleChoiceClick(e, choice)}
            >
              {currentCard[choice]}
            </button>
          ) : null
        )}
      </div>

      <button className="btn btn-warning" onClick={() => setShowAnswer(true)}>
        View Answer
      </button>
      {showAnswer && (
        <div className="mt-2">
          <p>
            <strong>Correct Answer:</strong> {currentCard.correctAnswer}
          </p>
          <p>
            <strong>Explanation:</strong> {currentCard.explanation}
          </p>
        </div>
      )}

      <div className="mt-3">
        <button
          className="btn btn-outline-danger me-2"
          onClick={() => updateDifficulty("hard")}
        >
          Mark as Hard
        </button>
        <button
          className="btn btn-outline-success"
          onClick={() => updateDifficulty("easy")}
        >
          Mark as Easy
        </button>
      </div>

      <div className="mt-3">
        <button
          className="btn btn-secondary me-2"
          onClick={() => handleNavigation(-1)}
        >
          Previous
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => handleNavigation(1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
