import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const apiKey = process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY;
const modelName = process.env.GOOGLE_MODEL;

if (!apiKey) {
  throw new Error("Missing Google API key. Set `GOOGLE_API_KEY` or `GEMINI_API_KEY`.");
}

if (!modelName) {
  console.warn(
    "`GOOGLE_MODEL` is not set in the environment; using fallback 'gemini-2.5-flash'. It is recommended to set `GOOGLE_MODEL` in your deployment to a supported model."
  );
}

// Use a safer fallback than the unsupported gemini-1.5-pro. Prefer explicitly setting
// `GOOGLE_MODEL` in your deployment environment (e.g., 'gemini-2.5-flash').
export const model = new ChatGoogleGenerativeAI({
  apiKey,
  model: modelName ?? "gemini-2.5-flash",
});
