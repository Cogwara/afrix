import { describe, it, expect } from "vitest";
import { ReputationService, WORKER_LEVELS } from "@/lib/reputation/service";

describe("Reputation & XP Service Unit Tests", () => {
  it("correctly identifies Newbie Level 1", () => {
    const info = ReputationService.getLevelInfo(0);
    expect(info.level).toBe(1);
    expect(info.name).toBe("Newbie");
    expect(info.progressPercent).toBe(0);
  });

  it("calculates progress percentage towards Level 2 (500 XP)", () => {
    const info = ReputationService.getLevelInfo(250);
    expect(info.level).toBe(1);
    expect(info.progressPercent).toBe(50);
  });

  it("correctly upgrades to Level 3 (Verified) at 2500 XP", () => {
    const info = ReputationService.getLevelInfo(2500);
    expect(info.level).toBe(3);
    expect(info.name).toBe("Verified");
  });

  it("correctly caps Pro Level 5 at 50,000 XP with 100% progress", () => {
    const info = ReputationService.getLevelInfo(60000);
    expect(info.level).toBe(5);
    expect(info.name).toBe("Pro");
    expect(info.progressPercent).toBe(100);
  });

  it("calculates weighted reputation score correctly (40% accuracy, 20% completion, 20% reliability, 10% quality, 10% fraud)", () => {
    const score = ReputationService.calculateReputation({
      accuracy: 100,
      completionRate: 100,
      reliability: 100,
      taskQuality: 100,
      fraudScore: 0,
    });
    expect(score).toBe(100);

    const penalizedScore = ReputationService.calculateReputation({
      accuracy: 90, // 36
      completionRate: 80, // 16
      reliability: 80, // 16
      taskQuality: 70, // 7
      fraudScore: 50, // 10 - 5 = 5
    });
    // Total = 36 + 16 + 16 + 7 + 5 = 80
    expect(penalizedScore).toBe(80);
  });
});
