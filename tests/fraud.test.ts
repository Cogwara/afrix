import { describe, it, expect } from "vitest";
import { FraudService } from "@/lib/fraud/service";

describe("Fraud Detection & Velocity Checks", () => {
  it("flags impossible completion speed (< 3 seconds) with high risk score", async () => {
    const started = new Date();
    const submitted = new Date(started.getTime() + 1500); // 1.5 seconds

    const result = await FraudService.evaluateSubmission({
      userId: "test-user-id",
      startedAt: started,
      submittedAt: submitted,
    });

    expect(result.riskScore).toBeGreaterThanOrEqual(45);
    expect(result.reasons).toContain("Impossible completion speed (< 3 seconds)");
    expect(["CHALLENGE", "REQUIRE_REVIEW", "RESTRICT", "BLOCK"]).toContain(result.action);
  });

  it("permits standard completion speeds without speed penalties", async () => {
    const started = new Date();
    const submitted = new Date(started.getTime() + 120000); // 2 minutes

    const result = await FraudService.evaluateSubmission({
      userId: "test-user-id",
      startedAt: started,
      submittedAt: submitted,
      answers: { q1: "First answer", q2: "Second unique answer", q3: "Third unique answer" },
    });

    expect(result.riskScore).toBe(0);
    expect(result.action).toBe("ALLOW");
  });
});
