"use client";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runWorkflow = async () => {
    setLoading(true);
    setOutput(null);

    try {
      const res = await fetch("/api/run-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      const data = await res.json().catch(() => ({ error: "Invalid JSON returned" }));
      setOutput(data);
    } catch (err: any) {
      setOutput({ error: err.message });
    }

    setLoading(false);
  };

  return (
    <main style={{ padding: 50 }}>
      <h1>AI Workflow Assistant</h1>
      <textarea
        style={{ width: "100%", height: 120, marginTop: 20 }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your text here..."
      />
      <button style={{ marginTop: 10 }} onClick={runWorkflow} disabled={loading}>
        {loading ? "Running..." : "Run Workflow"}
      </button>

      {output && (
        <pre style={{ marginTop: 20, background: "#eee", padding: 20 }}>
          {JSON.stringify(output, null, 2)}
        </pre>
      )}
    </main>
  );
}
