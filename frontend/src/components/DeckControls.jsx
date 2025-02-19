import React from "react";

export default function DeckControls({
  handleOrderDeck,
  handleShuffleDeck,
  handleDownloadCSV,
}) {
  return (
    <div className="mb-3">
      <button className="btn btn-secondary me-2" onClick={handleOrderDeck}>
        Order Deck
      </button>
      <button className="btn btn-secondary me-2" onClick={handleShuffleDeck}>
        Shuffle Deck
      </button>
      <button className="btn btn-info" onClick={handleDownloadCSV}>
        Download CSV
      </button>
    </div>
  );
}
