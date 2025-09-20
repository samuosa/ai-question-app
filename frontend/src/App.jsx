import React, { useEffect, useState, useCallback, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import DeckControls from "./components/DeckControls";
import TopicFilter from "./components/TopicFilter";
import QuestionCard from "./components/QuestionCard";
import Toast from "./components/Toast";
import { generateCSV, parseCSV, shuffleArray } from "./utils";
import LanguageFilter from "./components/LanguageFilter";
import QuestionTypeFilter from "./components/QuestionsTypeFilter";
import PdfMultiParser from "./components/PdfParser";
import GenerateQuestionsForm from "./components/GenerateQuestionsForm";
//import GenerateQuestions from "./components/GenerateQuestions";



export default function App() {
  const [masterCards, setMasterCards] = useState([]);
  const [currentDeck, setCurrentDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Toggles
  const [viewEasy, setViewEasy] = useState(true);

  // Show/hide answer
  const [showAnswer, setShowAnswer] = useState(false);

  // Topics
  const [selectedTopics, setSelectedTopics] = useState(new Set());
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [showMC, setShowMC] = useState(true);
  const [showOpen, setShowOpen] = useState(true);

  const [filterOpen, setFilterOpen] = useState(false);

  // Loading/Errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //generate questions
  const [generatedQuestions, setGeneratedQuestions] = useState([]);

  // Toast
  // We'll store a single toast message and type ("danger" or "success").
  // If we need multiple simultaneous toasts, store an array instead.
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("danger");

  // Key to force re-render of question card to reset highlights
  const [renderKey, setRenderKey] = useState(0);

  //Parsed pdfs
  const [parsed,setParsed]=useState(false)
  const [pdfContent,setPdfContent]=useState("")

  /** Fetch CSV on mount */
  useEffect(() => {
    fetch("/data.csv")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not OK");
        return res.text();
      })
      .then((csvText) => {
        const parsed = parseCSV(csvText);
        setMasterCards(parsed);
        rebuildDeck(parsed, "original", viewEasy, selectedTopics);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching CSV:", err);
        setError(err.message);
        setLoading(false);
      });
  },[]); // only once on mount

  /** Rebuild the deck applying filters & duplication logic. */
  const rebuildDeck = useCallback(
    (cards, order = "original") => {
      let deck = [...cards];

      // Filter by selected language
      if (selectedLanguage) {
        deck = deck.filter((c) => c.language === selectedLanguage);
      }

      // Filter by selected topics
      if (selectedTopics.size > 0) {
        deck = deck.filter((c) => selectedTopics.has(c.topic));
      }

      // Filter by question type
      deck = deck.filter((c) => (showMC && c.isMC) || (showOpen && c.isOpen));

      // Filter by difficulty
      if (!viewEasy) {
        deck = deck.filter((c) => c.difficulty !== "easy");
      }

      // Double "hard" questions
      deck = deck.flatMap((c) => (c.difficulty === "hard" ? [c, { ...c }] : c));

      if (order === "shuffle") {
        deck = shuffleArray(deck);
      }

      setCurrentDeck(deck);
      setCurrentIndex(0);
      setShowAnswer(false);
    },
    [selectedLanguage, selectedTopics, showMC, showOpen, viewEasy]
  );


  /** Re-run rebuild when relevant states change. 
   *  This fixes the ESLint warning about missing dependencies.
   */
  useEffect(() => {
    rebuildDeck(masterCards, "original", viewEasy, selectedTopics);
  }, [masterCards, viewEasy, selectedTopics, rebuildDeck]);

  const isDeckEmpty = currentDeck.length === 0;
  const currentCard = !isDeckEmpty ? currentDeck[currentIndex] : null;

  /** Mark as Hard/Easy => show toast. */
  function updateDifficulty(newDifficulty) {
    if (!currentCard) return;
    currentDeck[currentIndex].difficulty = newDifficulty;
    setCurrentDeck([...currentDeck]);

    // Update master
    const idx = masterCards.findIndex((c) => c.question === currentCard.question);
    if (idx >= 0) {
      const updatedMaster = [...masterCards];
      updatedMaster[idx].difficulty = newDifficulty;
      setMasterCards(updatedMaster);
    }
    // Show toast
    setToastType("success");
    setToastMsg(`Marked as ${newDifficulty.toUpperCase()}`);
  }
  function addGeneratedQuestions(newQuestions) {
    setGeneratedQuestions((prev) => [...prev, ...newQuestions]);
    setMasterCards((prev) => [...prev, ...newQuestions]);
  }  

  /** Navigation => reset highlights, hide answer. */
  function handleNavigation(step) {
    if (isDeckEmpty) return;
    const newIndex = (currentIndex + step + currentDeck.length) % currentDeck.length;
    setCurrentIndex(newIndex);
    setShowAnswer(false);
    setRenderKey((prev) => prev + 1); // force a new render => reset button classes
  }

  /** Reorder or shuffle. */
  function handleOrderDeck() {
    rebuildDeck(masterCards, "original", viewEasy, selectedTopics);
  }
  function handleShuffleDeck() {
    rebuildDeck(masterCards, "shuffle", viewEasy, selectedTopics);
  }

  /** Toggle a topic in/out of selectedTopics. */
  function toggleTopic(topic) {
    const newTopics = new Set(selectedTopics);
    if (newTopics.has(topic)) newTopics.delete(topic);
    else newTopics.add(topic);
    setSelectedTopics(newTopics);
  }

  /** Unique topics from master. */
  const allTopics = useMemo(
    () => Array.from(new Set(masterCards.map((c) => c.topic))),
    [masterCards]
  );

  /** Clear toast after 3s if present. */
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => {
        setToastMsg("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  /** Download updated CSV => includes new difficulties. */
  function handleDownloadCSV() {
    if (masterCards.length === 0) return;
    const csvOutput = generateCSV(masterCards);
    const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "updated_questions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /** If user picks a choice => highlight success/fail. */
  function handleChoiceClick(e, choice) {
    if (!currentCard) return;
    e.currentTarget.classList.remove("btn-outline-primary");
    // correct answer => show answer, success highlight
    if (currentCard.correctAnswer === choice) {
      e.currentTarget.classList.add("btn-success");
      setShowAnswer(true);
    } else {
      e.currentTarget.classList.add("btn-danger");
      setToastMsg("Wrong answer!");
      setToastType("danger");
    }
  }

  /** Render main UI or loading/error states. */
  if (loading) {
    return (
      <div className="container py-5">
        <div className="d-flex align-items-center">
          <strong>Loading CSV...</strong>
          <div className="spinner-border ms-2" role="status" aria-hidden="true" />
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Question Deck</h1>

      {/* Toggle easy questions */}
      <div className="form-check mb-3">
        <input
          className="form-check-input"
          type="checkbox"
          id="viewEasyCheckbox"
          checked={viewEasy}
          onChange={() => setViewEasy(!viewEasy)}
        />
        <label className="form-check-label" htmlFor="viewEasyCheckbox">
          View Easy Questions
        </label>
      </div>
      {/* Filters */}
      <LanguageFilter selectedLanguage={selectedLanguage} setSelectedLanguage={setSelectedLanguage} />
      <QuestionTypeFilter showMC={showMC} setShowMC={setShowMC} showOpen={showOpen} setShowOpen={setShowOpen} />

      {/* Deck Controls */}
      <DeckControls
        handleOrderDeck={handleOrderDeck}
        handleShuffleDeck={handleShuffleDeck}
        handleDownloadCSV={handleDownloadCSV}
      />

      {/* Topic Filter */}
      <TopicFilter
        allTopics={allTopics}
        selectedTopics={selectedTopics}
        toggleTopic={toggleTopic}
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
      />

      {/* Question Card */}
      <QuestionCard
        currentCard={currentCard}
        isDeckEmpty={isDeckEmpty}
        showAnswer={showAnswer}
        setShowAnswer={setShowAnswer}
        handleChoiceClick={handleChoiceClick}
        updateDifficulty={updateDifficulty}
        handleNavigation={handleNavigation}
        renderKey={renderKey}
      />


      {/*
      <GenerateQuestions addGeneratedQuestions={addGeneratedQuestions} />
      */}

      {/* Toast for success/wrong answer */}
      <Toast toastMsg={toastMsg} toastType={toastType} />
      <PdfMultiParser onParsed={e=>{
        console.log(e)
        if(e.length>10){
          setParsed(true)
          setPdfContent(e)
        }
      }}/>
      {parsed&&(
        <div className="">
          <p> generate questions for pdf?</p>
          <GenerateQuestionsForm apiToken="dsafvyd" textContent={pdfContent} onResponse={e=>console.log(e)}/>
        </div>
      )}
    </div>
  );
}
