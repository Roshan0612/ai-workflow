import { StateGraph, Annotation } from "@langchain/langgraph";
import { model } from "./model";

const StateAnnotation = Annotation.Root({
  input: Annotation<string>,
  summary: Annotation<string>,
  actions: Annotation<string>,
});

const graph = new StateGraph(StateAnnotation);

// Step 1 → Summarize
const summarizeAction = async (state: typeof StateAnnotation.State) => {
  const res = await model.invoke(`Summarize this:\n${state.input}`);
  const block: any = Array.isArray(res.content) ? res.content[0] : res.content;
  const text = typeof block === "string" ? block : block?.text ?? String(block);
  return { summary: text };
};

const actionsAction = async (state: typeof StateAnnotation.State) => {
  const res = await model.invoke(
    `Generate 3 actionable points for:\n${state.summary}`
  );
  const block: any = Array.isArray(res.content) ? res.content[0] : res.content;
  const text = typeof block === "string" ? block : block?.text ?? String(block);
  return { actions: text };
};

// Add nodes (object form preserves per-node return typings)
graph.addNode({
  summarize: summarizeAction,
  actions: actionsAction,
});

// Connect nodes: start -> summarize -> actions
graph.addEdge("__start__", "summarize" as any);
graph.addEdge("summarize" as any, "actions" as any);

export const workflow = graph.compile();
