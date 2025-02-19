// Shared utility functions

/**
 * parseCSV(csv)
 * Takes raw CSV text and converts it into an array of objects.
 */
export function parseCSV(csv) {
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(";").map((h) => h.trim());
  const dataLines = lines.slice(1);

  return dataLines.map((line) => {
    const cols = line.split(";");
    const qObj = {};
    headers.forEach((header, i) => {
      qObj[header] = cols[i] !== undefined ? cols[i].trim() : null;
    });

    // Auto-detect question type
    qObj.isMC = !!qObj.a; // MC if option A exists
    qObj.isOpen = !qObj.a; // Open if option A is empty

    return qObj;
  });
}


/**
 * shuffleArray(arr)
 * Returns a shuffled copy of the array using the Fisher-Yates shuffle.
 */
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Utility: generate CSV text from updated cards. */
export function generateCSV(cards) {
  if (!cards || cards.length === 0) return "";
  const keys = Object.keys(cards[0]);
  const header = keys.join(";");
  const rows = cards.map((card) =>
    keys.map((k) => (card[k] == null ? "" : card[k])).join(";")
  );
  return [header, ...rows].join("\n");
}