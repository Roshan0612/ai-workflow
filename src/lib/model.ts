import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// Read credentials and model name from environment variables.
// Prefer `GOOGLE_API_KEY` and `GOOGLE_MODEL` for clarity.
const apiKey = process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY;
const modelName = process.env.GOOGLE_MODEL;

if (!apiKey) {
  throw new Error(
    "Missing Google API key. Set the environment variable `GOOGLE_API_KEY` (or `GEMINI_API_KEY`)."
  );
}

if (!modelName) {
  // Warn developer and provide instructions to list available models.
  // Do not silently hardcode a model that may not be available for the API version.
  console.warn(
    "Environment variable `GOOGLE_MODEL` is not set. Set `GOOGLE_MODEL` to a valid model name (for example `gemini-1.5` or another model supported by your account).\n" +
      "To list available models you can run: curl -H \"Authorization: Bearer $GOOGLE_API_KEY\" https://generativelanguage.googleapis.com/v1/models\n" +
      "Or check the Google Cloud console / Generative AI Models page.\n" +
      "Until you set `GOOGLE_MODEL`, the code will attempt to use a default model which may produce a 404 if unsupported."
  );
}

export const model = new ChatGoogleGenerativeAI({
  apiKey,
  model: modelName ?? "gemini-1.5-pro",
});
