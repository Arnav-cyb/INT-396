import { NextRequest, NextResponse } from "next/server";
import { runAnalysisPipeline } from "@/ml/pipeline";
import { RawTransaction } from "@/lib/types";
import { PRELOADED_SAMPLE_DATASET } from "@/datasets/sampleData";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      transactions,
      datasetName = "Retail Transactions",
      algorithm = "kmeans",
      k = 4,
      eps = 1.8,
      minSamples = 4,
      ruleAlgorithm = "fpgrowth",
      minSupport = 0.04,
      minConfidence = 0.2,
      minLift = 1.05,
      usePythonService = false,
    } = body;

    const dataToProcess: RawTransaction[] =
      Array.isArray(transactions) && transactions.length > 0
        ? transactions
        : PRELOADED_SAMPLE_DATASET;

    // Check if an external Python ML service URL is configured
    const pythonServiceUrl = process.env.PYTHON_ML_SERVICE_URL;

    if (usePythonService && pythonServiceUrl) {
      try {
        const pyRes = await fetch(`${pythonServiceUrl}/api/ml/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactions: dataToProcess,
            algorithm,
            k,
            eps,
            min_samples: minSamples,
            rule_algorithm: ruleAlgorithm,
            min_support: minSupport,
            min_confidence: minConfidence,
            min_lift: minLift,
          }),
        });

        if (pyRes.ok) {
          const pyData = await pyRes.json();
          return NextResponse.json({ ...pyData, executionSource: "Python ML Service" });
        }
      } catch (err) {
        console.warn("Python service unreachable, falling back to TypeScript ML engine:", err);
      }
    }

    // Execute in-engine analytical pipeline
    const result = runAnalysisPipeline(dataToProcess, {
      datasetName,
      algorithm,
      k: Number(k),
      eps: Number(eps),
      minSamples: Number(minSamples),
      ruleAlgorithm,
      minSupport: Number(minSupport),
      minConfidence: Number(minConfidence),
      minLift: Number(minLift),
    });

    return NextResponse.json({
      ...result,
      executionSource: "Next.js ML Engine (Standard)",
    });
  } catch (error: any) {
    console.error("Pipeline Execution Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to process dataset through ML pipeline.",
      },
      { status: 500 }
    );
  }
}
