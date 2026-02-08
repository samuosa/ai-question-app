import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function GenerateQuestions({
  textContent = "",
  apiToken = "",
  onResponse = () => {}
}) {
  // ▲ state
  const [mcq, setMcq] = useState(7);
  const [open, setOpen] = useState(3);
  const [tokenInput, setTokenInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  // ▲ helpers
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = tokenInput.trim() || apiToken.trim();
    if (!token) {
      setError("API token required");
      return;
    }
    setLoading(true);
    setError("");
    setOutput("");

    const prompt = `Generate ${mcq} multiple‑choice questions (each with 4 options and answer key) and ${open} open questions based solely on the following text:\n\n${textContent}`;

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7
        })
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || "";
      setOutput(content);
      onResponse(content); // ▼ emit event
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // ▲ render
  return (
    <div className="container my-3">
      <h5>Generate Questions</h5>
      <form className="row g-3 align-items-end" onSubmit={handleSubmit}>
        <div className="col-md-3">
          <label className="form-label">Multiple‑choice</label>
          <input
            type="number"
            min="0"
            className="form-control"
            value={mcq}
            onChange={(e) => setMcq(parseInt(e.target.value, 10) || 0)}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Open questions</label>
          <input
            type="number"
            min="0"
            className="form-control"
            value={open}
            onChange={(e) => setOpen(parseInt(e.target.value, 10) || 0)}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">API Token (optional)</label>
          <input
            type="password"
            className="form-control"
            placeholder="sk-..."
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
          />
        </div>
        <div className="col-md-2 d-grid">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !(tokenInput.trim() || apiToken.trim())}
          >
            {loading ? "Generating…" : "Submit"}
          </button>
        </div>
      </form>

      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          {error}
        </div>
      )}

      {output && (
        <pre
          className="mt-3 p-3 bg-light border rounded"
          style={{ whiteSpace: "pre-wrap" }}
        >
          {output}
        </pre>
      )}
    </div>
  );
}
