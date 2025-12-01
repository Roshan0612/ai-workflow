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

// Helper to extract text from Gemini responses
function extractText(res: any): string {
  const c = Array.isArray(res.content) ? res.content[0] : res.content;
  if (typeof c === "string") return c;
  if (typeof c?.text === "string") return c.text;
  return String(c);
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
const graph = new StateGraph(StateAnnotation, { nodes: ["summarize", "actions"] });
graph.addNode("summarize", summarizeAction);
graph.addNode("actions", actionsAction);

graph.addEdge("__start__", "summarize");
graph.addEdge("summarize", "actions");

export const workflow = graph.compile();
