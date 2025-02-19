import React from "react";

export default function QuestionTypeFilter({ showMC, setShowMC, showOpen, setShowOpen }) {
  return (
    <div className="mb-3">
      <label className="me-2">Question Type:</label>
      <button
        className={`btn btn-sm me-2 ${showMC ? "btn-primary" : "btn-outline-secondary"}`}
        onClick={() => setShowMC(!showMC)}
      >
        MC
      </button>
      <button
        className={`btn btn-sm ${showOpen ? "btn-primary" : "btn-outline-secondary"}`}
        onClick={() => setShowOpen(!showOpen)}
      >
        Open
      </button>
    </div>
  );
}
