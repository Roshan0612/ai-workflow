import { NextRequest, NextResponse } from "next/server";
import { workflow } from "../../../lib/graph";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  const result = await workflow.invoke({ input: text });

  return NextResponse.json(result);
}
