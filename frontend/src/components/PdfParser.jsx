import React, { useState } from "react";
/* Library: pdfjs-dist (MIT, 18k+ ⭐). Actively maintained; robust PDF text extraction. */
import * as pdfjsLib from "pdfjs-dist/webpack";

export default function PdfMultiParser({ onParsed = () => {} }) {
  // ▲ state
  const [files, setFiles] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [busy, setBusy] = useState(false);

  // ▲ helpers
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []).filter((f) =>
      /\.pdf$/i.test(f.name)
    );
    setFiles(selected);
    setStatuses({});
  };

  const updateStatus = (name, message) =>
    setStatuses((s) => ({ ...s, [name]: message }));

  const extractPageText = async (page) => {
    const tc = await page.getTextContent({ normalizeWhitespace: true });
    const lines = {};
    tc.items.forEach((it) => {
      const y = Math.round(it.transform[5]);
      (lines[y] = lines[y] || []).push(it);
    });
    return Object.keys(lines)
      .sort((a, b) => b - a)
      .map((y) =>
        lines[y]
          .sort((a, b) => a.transform[4] - b.transform[4])
          .map((it) => it.str)
          .join(" ")
      )
      .join("\n");
  };

  const parseFiles = async () => {
    if (!files.length) return;
    setBusy(true);
    const allText = [];

    for (const file of files) {
      updateStatus(file.name, "Parsing…");
      try {
        const buffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        let fileText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          fileText += (await extractPageText(page)) + "\n\n";
        }
        if (fileText.trim()) {
          allText.push(fileText);
          updateStatus(file.name, `✅ Parsed ${file.name}`);
        } else {
          updateStatus(file.name, `⚠️ No readable text found in ${file.name}`);
        }
      } catch {
        updateStatus(file.name, `❌ Error parsing ${file.name}`);
      }
    }

    setBusy(false);
    onParsed(allText.join("\n"));
  };

  // ▲ render
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "1rem" }}>
      <input
        type="file"
        multiple
        accept=".pdf"
        onChange={handleFileChange}
        style={{ marginBottom: "0.5rem" }}
      />
      <br />
      <button onClick={parseFiles} disabled={busy || !files.length}>
        {busy ? "Parsing…" : "Parse"}
      </button>
      <div style={{ marginTop: "1rem", whiteSpace: "pre-wrap" }}>
        {Object.entries(statuses).map(([name, msg]) => (
          <div key={name}>{msg}</div>
        ))}
      </div>
    </div>
  );
}
