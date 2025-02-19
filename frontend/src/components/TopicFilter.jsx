import React from "react";

/**
 * TopicFilter
 * 
 * Props:
 * - allTopics: string[] array of all unique topic names
 * - selectedTopics: Set<string> the currently active topics
 * - toggleTopic(topicName: string): toggles a topic in/out of the set
 * - filterOpen: boolean - whether to show/hide topic tags
 * - setFilterOpen: function - toggles the filter UI
 */

export default function TopicFilter({
  allTopics,
  selectedTopics,
  toggleTopic,
  filterOpen,
  setFilterOpen,
}) {
  return (
    <div className="mb-3">
      <button
        className="btn btn-primary"
        onClick={() => setFilterOpen(!filterOpen)}
      >
        {filterOpen ? "Hide Topics" : "Filter by Topic"}
      </button>
      {filterOpen && (
        <div className="mt-3">
          {allTopics.map((topic) => {
            const isActive = selectedTopics.has(topic);
            return (
              <button
                key={topic}
                onClick={() => toggleTopic(topic)}
                className={
                  "btn btn-sm me-2 mb-2 " +
                  (isActive ? "btn-primary" : "btn-outline-secondary")
                }
              >
                {topic}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
