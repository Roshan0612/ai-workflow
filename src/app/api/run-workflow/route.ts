import { NextResponse } from "next/server";
import { workflow } from "@/lib/graph";

export async function POST(req: Request) {
  try {
    const { input } = await req.json();

    if (!input) {
      return NextResponse.json({ error: "Input text is required." }, { status: 400 });
    }

    const result = await workflow.invoke({ input });

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("API ERROR:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
