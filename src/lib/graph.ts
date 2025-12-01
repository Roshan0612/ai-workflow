import { StateGraph, Annotation } from "@langchain/langgraph";
import { model } from "./model";

const StateAnnotation = Annotation.Root({
  input: Annotation<string>,
  summary: Annotation<string>,
  actions: Annotation<string>,
});

function sanitizeForJSON(s: string): string {
  return s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ").trim();
}

function extractText(res: any): string {
  try {
    if (!res) return "";
    if (typeof res === "string") return sanitizeForJSON(res);

    const candidates = [res.content, res.output, res.outputs, res.outputText, res.result, res.message?.content];
    let block: any = undefined;
    for (const c of candidates) {
      if (c === undefined) continue;
      block = Array.isArray(c) ? c[0] : c;
      if (block !== undefined) break;
    }

    if (block === undefined) block = res;

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

const summarizeAction = async (state: typeof StateAnnotation.State) => {
  const prompt = `Summarize this text concisely:\n${state.input}`;
  const res = await model.invoke(prompt);
  return { summary: extractText(res) };
};

const actionsAction = async (state: typeof StateAnnotation.State) => {
  const prompt = `Based on this summary, generate 3 actionable steps:\n${state.summary}`;
  const res = await model.invoke(prompt);
  return { actions: extractText(res) };
};

const graph = new StateGraph(StateAnnotation, { nodes: ["summarizeNode", "actionsNode"] });
graph.addNode({
  summarizeNode: summarizeAction,
  actionsNode: actionsAction,
});

graph.addEdge("__start__", "summarizeNode" as any);
graph.addEdge("summarizeNode" as any, "actionsNode" as any);

export const workflow = graph.compile();
