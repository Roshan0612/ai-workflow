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
      setOutput({ error: err?.message ?? String(err) });
    } finally {
      setLoading(false);
    }
  };

  // Parse actions string into individual lines/items
  const sanitizeDisplay = (s: string | undefined): string => {
    if (!s) return "";
    let t = String(s);
    // remove code fences
    t = t.replace(/```[\s\S]*?```/g, "");
    // un-wrap inline code
    t = t.replace(/`([^`]+)`/g, "$1");
    // remove bold/italic/strikethrough markers
    t = t.replace(/(\*{1,2}|_{1,2}|~{2})/g, "");
    // remove leading blockquotes
    t = t.replace(/^>\s?/gm, "");
    // collapse multiple blank lines
    t = t.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n");
    return t.trim();
  };

  const parseActions = (actionsText: string | undefined): string[] => {
    if (!actionsText) return [];
    // Normalize bullets and numbers into line-separated items
    // Split on newlines, or numbered/bulleted lists like '1. ', '- ', '* '
    const lines = actionsText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .map((l) => l.replace(/^\d+\.|^-|^\*|^•/u, "").trim())
      .map((l) => sanitizeDisplay(l));
    if (lines.length > 0) return lines;
    // fallback: try splitting by semicolons
    return actionsText
      .split(/;|\u2022/)
      .map((s) => sanitizeDisplay(s.trim()))
      .filter(Boolean);
  };

  return (
    <div className="workflow-root">
      <section className="card" style={{ width: "100%" }}>
        {loading && <div className="loader" />}

        <h2 className="card-title">Enter text to process</h2>

        <textarea
          className="input-area"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your text here..."
        />

        <div className="actions-row">
          <button
            className={`primary ${input.trim() === "" ? "full" : ""}`}
            onClick={runWorkflow}
            disabled={loading || input.trim() === ""}
          >
            {loading ? "Running..." : "Run Workflow"}
          </button>
        </div>
      </section>

      {/* Stack: Summary then Actions */}
      <section style={{ width: "100%", display: "grid", gap: 18 }}>
        <div className="card result-card">
          <h4 className="result-title">Summary</h4>
          {output?.error ? (
            <div className="empty-hint">{output.error}</div>
          ) : (
            <div className="output-pre">{output?.summary || <span className="empty-hint">No summary yet</span>}</div>
          )}
        </div>

        <div className="card result-card">
          <h4 className="result-title">Actionable Steps</h4>
          {output?.error ? (
            <div className="empty-hint">{output.error}</div>
          ) : (
            <div>
              {output?.actions ? (
                <div className="actions-list">
                  {parseActions(output.actions).map((item, idx) => (
                    <div className="action-item" key={idx}>
                      <div className="action-index">{idx + 1}</div>
                      <div className="action-text">{item}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-hint">No actions yet</div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
