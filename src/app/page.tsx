"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);

  async function run() {
    const res = await fetch("/api/run-workflow", {
      method: "POST",
      body: JSON.stringify({ text: input }),
    });

    const data = await res.json();
    setResult(data);
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      <h1>AI Workflow Assistant</h1>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter your text..."
        rows={6}
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "1rem",
        }}
      />

      <button
        onClick={run}
        style={{
          marginTop: "1rem",
          padding: "10px 15px",
        }}
      >
        Run Workflow
      </button>

      {result && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Summary</h2>
          <p>{result.summary}</p>

          <h2>Action Points</h2>
          <p>{result.actions}</p>
        </div>
      )}
    </main>
  );
}
