import { NextResponse } from "next/server";
import { workflow } from "@/lib/graph";

function sanitizeForJSON(s: string): string {
  return String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ").trim();
}

function extractFromResult(result: any, key: string): string {
  if (!result) return "";
  const candidates = [result[key], result?.state?.[key], result?.result?.[key], result?.output?.[key]];
  for (const c of candidates) {
    if (c === undefined || c === null) continue;
    if (typeof c === "string") return sanitizeForJSON(c);
    try {
      return sanitizeForJSON(JSON.stringify(c));
    } catch {
      return sanitizeForJSON(String(c));
    }
  }
  return "";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = body?.input ?? body?.text ?? "";
    if (!input) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 });
    }

    const raw = await workflow.invoke({ input });

    const summary = extractFromResult(raw, "summary");
    const actions = extractFromResult(raw, "actions");

    return NextResponse.json({ summary, actions });
  } catch (err: any) {
    console.error("API ERROR:", err);
    const msg = err?.message ?? String(err);
    // Detect common Google Generative API model-not-found message and provide actionable guidance
    if (msg.includes("models/") && (msg.includes("not found") || msg.includes("not supported"))) {
      const help =
        "Model not found or unsupported by API version. Ensure `GOOGLE_MODEL` in your deployment is set to a supported model (for example, 'gemini-2.5-flash'). Call ListModels in the Google Generative API to see available models.";
      return NextResponse.json({ error: help }, { status: 502 });
    }
    return NextResponse.json({ error: msg ?? "Internal Server Error" }, { status: 500 });
  }
}
