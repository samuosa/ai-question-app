import React, { useState } from "react";
import { parseCSV } from "../utils";
import { getDocument, GlobalWorkerOptions, pdfjsWorker } from "pdfjs-dist";

// Set worker source
GlobalWorkerOptions.workerSrc = pdfjsWorker

const OPENAI_API_KEY = "your-hardcoded-api-key"; // Replace this with your actual key

export default function GenerateQuestions({ addGeneratedQuestions }) {
  const [numMC, setNumMC] = useState(0);
  const [numOpen, setNumOpen] = useState(0);
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState(null);
  const [error, setError] = useState(null);

  // Handles file selection
  function handleFileChange(event) {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      setPdfFile(null);
      alert("Please upload a valid PDF file.");
    }
  }

  // Extracts text from PDF
  async function extractTextFromPDF(file) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const pdfData = new Uint8Array(reader.result);
          const pdf = await getDocument({ data: pdfData }).promise;
          let text = "";
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            text += textContent.items.map((item) => item.str).join(" ") + "\n";
          }

          resolve(text);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
    });
  }

  // Calls OpenAI to generate questions
  async function generateQuestions() {
    setLoading(true);
    setError(null);

    try {
      let pdfText = "";
      if (pdfFile) {
        pdfText = await extractTextFromPDF(pdfFile);
      }

      // Hardcoded prompt template
      const prompt = `
Analyze the provided PDF document thoroughly and extract key concepts, relationships, and relevant topics covered in the material. Your task is to generate a CSV file containing **${numOpen} open questions** and **${numMC} multiple-choice questions** that test a deep understanding of the document.

### **Instructions:**
1. **Understand the entire document**: Identify key themes, definitions, frameworks, models, methodologies, and case studies discussed.
2. **Derive exam questions**:
   - Generate **Y multiple-choice questions (MCQs)** covering core ideas, technical details, and applied understanding.
   - Generate **X open-ended questions** focusing on explanation, comparison, and application of concepts.
3. **Ensure diversity in question difficulty**:
   - Include both **basic conceptual questions** and **higher-order application-based questions**.
   - Ensure **connections between topics** are tested (e.g., how concepts interrelate).
4. **Use the language of the document** (detect if the content is in English or German, and use the same language for all questions).

### **CSV Output Format:**
Each row should follow this exact structure:
topic;question;a;b;c;d;correctAnswer;explanation;difficulty;language
- **topic**: The relevant topic covered in the document.
- **question**: The exam question.
- **a, b, c, d**: Answer choices (for MCQs only, leave empty for open-ended questions).
- **correctAnswer**: The correct option (for MCQs only, leave empty for open-ended questions).
- **explanation**: A brief, precise explanation of why the answer is correct or what should be included in the open-ended answer.
- **difficulty**: Leave this field empty.
- **language**: **"DE"** for German, **"EN"** for English (match the language of the document).

### **Example Output (for a document on IT and Operations):**
Supply Chain Management;Was ist das Hauptziel des Supply Chain Managements (SCM)?;Maximierung von Lagerbeständen;Vermeidung von Verschwendung entlang der Lieferkette;Erhöhung der Produktionskosten;Minimierung der Kundenzufriedenheit;b;Das SCM zielt darauf ab, Verschwendung in der gesamten Lieferkette zu vermeiden und Prozesse effizient zu gestalten.;;DE
IT und Operations;Erklären Sie das Konzept des Supply Chain Managements und diskutieren Sie, wie IT-Systeme zur Optimierung der Lieferkette beitragen.;;;;;;;Die Antwort sollte die Ziele und Funktionen des SCM erläutern und aufzeigen, wie IT-Lösungen Transparenz, Planung und Steuerung in der Lieferkette verbessern.;;DE


### **Requirements:**
- The generated questions **must be well-structured, clear, and relevant**.
- **Avoid generic questions**—ensure each question is directly derived from the document’s content.
- **Ensure variety**: Some MCQs should test factual knowledge, while others assess deeper understanding.
- **Include applied and scenario-based questions** when appropriate.

---
Use the following PDF content if provided:
---
${pdfText || "No PDF uploaded"}
---
`;

      // OpenAI API request
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "system", content: prompt }],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Failed to fetch questions");

      // Extract text response (assuming GPT-4o returns pure CSV text)
      const csvText = data.choices[0].message.content;

      // Parse CSV
      const parsedQuestions = parseCSV(csvText);
      setCsvData(parsedQuestions);
      addGeneratedQuestions(parsedQuestions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-3 mb-3">
      <h4>Generate Questions</h4>

      {/* Question Type Selection */}
      <div className="mb-3">
        <label>Number of Multiple Choice Questions:</label>
        <input
          type="number"
          className="form-control"
          min="0"
          max="10"
          value={numMC}
          onChange={(e) => setNumMC(parseInt(e.target.value))}
        />
      </div>

      <div className="mb-3">
        <label>Number of Open Questions:</label>
        <input
          type="number"
          className="form-control"
          min="0"
          max="10"
          value={numOpen}
          onChange={(e) => setNumOpen(parseInt(e.target.value))}
        />
      </div>

      {/* PDF Upload */}
      <div className="mb-3">
        <label>Upload PDF (optional):</label>
        <input type="file" className="form-control" accept="application/pdf" onChange={handleFileChange} />
      </div>

      {/* Generate Button */}
      <button className="btn btn-primary" onClick={generateQuestions} disabled={loading}>
        {loading ? "Generating..." : "Generate Questions"}
      </button>

      {/* Error Message */}
      {error && <div className="alert alert-danger mt-3">{error}</div>}

      {/* CSV Table */}
      {csvData && (
        <div className="mt-3">
          <h5>Generated Questions</h5>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Topic</th>
                <th>Question</th>
                <th>A</th>
                <th>B</th>
                <th>C</th>
                <th>D</th>
                <th>Correct Answer</th>
                <th>Explanation</th>
                <th>Difficulty</th>
                <th>Language</th>
              </tr>
            </thead>
            <tbody>
              {csvData.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.topic}</td>
                  <td>{row.question}</td>
                  <td>{row.a}</td>
                  <td>{row.b}</td>
                  <td>{row.c}</td>
                  <td>{row.d}</td>
                  <td>{row.correctAnswer}</td>
                  <td>{row.explanation}</td>
                  <td>{row.difficulty}</td>
                  <td>{row.language}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
