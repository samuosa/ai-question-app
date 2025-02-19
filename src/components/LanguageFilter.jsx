import React from "react";

export default function LanguageFilter({ selectedLanguage, setSelectedLanguage }) {
  return (
    <div className="mb-3">
      <label className="me-2">Language:</label>
      {["DE", "EN"].map((lang) => (
        <button
          key={lang}
          className={`btn btn-sm me-2 ${selectedLanguage === lang ? "btn-primary" : "btn-outline-secondary"}`}
          onClick={() => setSelectedLanguage(lang)}
        >
          {lang}
        </button>
      ))}
      <button
        className={`btn btn-sm ${!selectedLanguage ? "btn-primary" : "btn-outline-secondary"}`}
        onClick={() => setSelectedLanguage(null)}
      >
        All
      </button>
    </div>
  );
}
