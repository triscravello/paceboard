import { describe, expect, it } from "vitest";
import { SEED_VIEWER_ID } from "./fixtures/seed-activities";
import { createSeededActivityRepository } from "./seeded-activity-repository";
import type { ActivityId } from "./types";

describe("seeded activity repository", () => {
  const repo = createSeededActivityRepository();

  it("returns unique, stable ids across reads", async () => {
    const first = (await repo.listForViewer(null)).map((a) => a.id);
    const second = (await repo.listForViewer(null)).map((a) => a.id);
    expect(first.length).toBeGreaterThan(0);
    expect(new Set(first).size).toBe(first.length);
    expect(second).toEqual(first);
  });

  it("orders newest first", async () => {
    const dates = (await repo.listForViewer(null)).map((a) => a.startedAt);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("keeps every metric numeric", async () => {
    for (const a of await repo.listForViewer(null)) {
      expect(typeof a.distanceMeters).toBe("number");
      expect(typeof a.movingTimeSeconds).toBe("number");
      expect(typeof a.elevationGainMeters).toBe("number");
      expect(typeof a.kudosCount).toBe("number");
      expect(
        a.averageHeartRateBpm === null ||
          typeof a.averageHeartRateBpm === "number",
      ).toBe(true);
    }
  });

  it("is anonymous-safe and viewer-relative", async () => {
    const anon = await repo.listForViewer(null);
    const viewer = await repo.listForViewer(SEED_VIEWER_ID);
    expect(anon.every((a) => !a.viewerHasKudoed)).toBe(true);
    expect(viewer.some((a) => a.viewerHasKudoed)).toBe(true);
  });

  it("does not allow plain strings as ActivityId", () => {
    // @ts-expect-error a plain string is not an ActivityId
    const id: ActivityId = "act_001";
    expect(id).toBe("act_001");
  });
});
