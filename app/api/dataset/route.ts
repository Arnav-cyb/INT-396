import { NextRequest, NextResponse } from "next/server";
import { PRELOADED_SAMPLE_DATASET } from "@/datasets/sampleData";
import { cleanTransactions } from "@/ml/preprocessing";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") || 50);
    const offset = Number(searchParams.get("offset") || 0);

    const { summary, cleaned } = cleanTransactions(PRELOADED_SAMPLE_DATASET);
    const paginated = cleaned.slice(offset, offset + limit);

    return NextResponse.json({
      summary,
      total: cleaned.length,
      limit,
      offset,
      data: paginated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
