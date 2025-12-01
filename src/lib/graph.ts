import { StateGraph, Annotation } from "@langchain/langgraph";
import { model } from "./model";

// ----------------------
// Annotation Schema
// ----------------------
const StateAnnotation = Annotation.Root({
  input: Annotation<string>,
  summary: Annotation<string>,
  actions: Annotation<string>,
});

// ----------------------
// Helper to safely extract text from Gemini/GenAI responses and sanitize
// ----------------------
function sanitizeForJSON(s: string): string {
  // Remove control characters except common whitespace
  return s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ").trim();
}

function extractText(res: any): string {
  try {
    if (!res) return "";

    // If response is a plain string
    if (typeof res === "string") return sanitizeForJSON(res);

    // Common fields used by different runtimes
    const candidates = [
      res.content,
      res.output,
      res.outputs,
      res.outputText,
      res.result,
      res.message?.content,
    ];

    let block: any = undefined;
    for (const c of candidates) {
      if (c === undefined) continue;
      block = Array.isArray(c) ? c[0] : c;
      if (block !== undefined) break;
    }

    if (block === undefined) block = res;

    // try different nested fields
    const text =
      (typeof block === "string" && block) ||
      block?.text ||
      block?.outputText ||
      (block?.content && (Array.isArray(block.content) ? block.content[0] : block.content)) ||
      (block?.candidate && block.candidate?.content) ||
      String(block);

    return sanitizeForJSON(String(text));
  } catch {
    return "";
  }
}

// ----------------------
// Node: Summarize
// ----------------------
const summarizeAction = async (state: typeof StateAnnotation.State) => {
  const prompt = `Summarize this text concisely:\n${state.input}`;
  const res = await model.invoke(prompt);
  return { summary: extractText(res) };
};

// ----------------------
// Node: Actions
// ----------------------
const actionsAction = async (state: typeof StateAnnotation.State) => {
  const prompt = `Based on this summary, generate 3 actionable steps:\n${state.summary}`;
  const res = await model.invoke(prompt);
  return { actions: extractText(res) };
};

// ----------------------
// Build Graph
// ----------------------
const graph = new StateGraph(StateAnnotation, { nodes: ["summarizeNode", "actionsNode"] });
graph.addNode({
  summarizeNode: summarizeAction,
  actionsNode: actionsAction,
});

graph.addEdge("__start__", "summarizeNode" as any);
graph.addEdge("summarizeNode" as any, "actionsNode" as any);

// ----------------------
// Compile workflow and force JSON-safe outputs
// ----------------------
export const workflow = graph.compile();
