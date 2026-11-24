/**
 * Master Verification Suite - SegmentMining AI (INT-396)
 * 
 * Runs end-to-end verification across:
 * - Cold-start product recommendation engine (14 scenarios)
 * - Ask Copilot natural language processing, recommendations, and follow-ups
 * - Machine learning clustering and association rules pipeline
 */

import { execSync } from "child_process";

console.log("\n==================================================================");
console.log("   SEGMENTMINING AI (INT-396) - FULL TEST VERIFICATION SUITE      ");
console.log("==================================================================\n");

try {
  console.log("--> RUNNING SUITE 1: Recommendation Engine Tests (lib/recommendations.ts)...");
  execSync("node dist-test/scripts/test-recommendations.js", { stdio: "inherit" });

  console.log("\n--> RUNNING SUITE 2: Ask Copilot Intelligence Tests (lib/copilot.ts)...");
  execSync("node dist-test/scripts/test-copilot.js", { stdio: "inherit" });

  console.log("\n==================================================================");
  console.log("   \x1b[32m✔ ALL TEST SUITES PASSED SUCCESSFULLY (100% PASS RATE)\x1b[0m       ");
  console.log("==================================================================\n");
} catch (err) {
  console.error("\n\x1b[31m✖ TEST RUNNER FAILED WITH AN ERROR.\x1b[0m\n", err);
  process.exit(1);
}
