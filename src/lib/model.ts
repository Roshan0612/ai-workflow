import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const apiKey = process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY;
const modelName = process.env.GOOGLE_MODEL;

if (!apiKey) {
  throw new Error("Missing Google API key. Set `GOOGLE_API_KEY` or `GEMINI_API_KEY`.");
}

if (!modelName) {
  console.warn(
    "`GOOGLE_MODEL` is not set. Set it to a valid model (e.g. gemini-2.5-flash)."
  );
}

export const model = new ChatGoogleGenerativeAI({
  apiKey,
  model: modelName ?? "gemini-1.5-pro",
});
