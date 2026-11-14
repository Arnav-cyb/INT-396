import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    app: "Category Association Discovery Across Clustered Transaction Segments",
    version: "1.0.0",
    engine: "TypeScript Full Next.js ML Pipeline",
    pythonFallbackAvailable: Boolean(process.env.PYTHON_ML_SERVICE_URL),
    timestamp: new Date().toISOString(),
  });
}
