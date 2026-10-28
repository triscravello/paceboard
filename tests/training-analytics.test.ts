import { describe, expect, test } from "vitest";
import { aggregateTrainingAnalytics, weekKeyForInstant } from "@/lib/training-analytics";
import type { AnalyticsActivity, AnalyticsSelection } from "@/types/training-analytics";

const selection: AnalyticsSelection = { weeks: 4, endDate: "2026-03-15", timeZone: "America/New_York" };
const activity = (recordedAt: string, distance: number, seconds: number, elevation = 0): AnalyticsActivity => ({ recordedAt: new Date(recordedAt), distanceHundredthsMiles: distance, elapsedSeconds: seconds, elevationGainFeet: elevation });

describe("training analytics", () => {
  test("uses weighted pace, integer totals, zero-filled weeks, and documented rounding", () => {
    const dto = aggregateTrainingAnalytics([
      activity("2026-03-02T12:00:00Z", 100, 600, 10),
      activity("2026-03-03T12:00:00Z", 900, 4500, 20),
      activity("2026-03-10T12:00:00Z", 0, 300, 5),
    ], selection);
    expect(dto.summary).toMatchObject({ totalDistanceMiles: 10, totalDurationSeconds: 5400, averagePaceSecondsPerMile: 510, totalElevationGainFeet: 35, activityCount: 3 });
    expect(dto.weeks.some((week) => week.distanceMiles === 0)).toBe(true);
    expect(dto.weeks.at(-1)?.rollingAverageMiles).not.toBeNull();
  });
  
  test("keeps year-boundary weeks under their Monday date", () => {
    expect(weekKeyForInstant(new Date("2027-01-01T12:00:00Z"), "America/New_York")).toBe("2026-12-28");
  });

  test("groups exact instants through the selected timezone and is deterministic", () => {
    const rows = [activity("2026-03-08T06:30:00Z", 300, 1800), activity("2026-03-08T07:30:00Z", 400, 2100)];
    expect(aggregateTrainingAnalytics(rows, selection)).toEqual(aggregateTrainingAnalytics(rows, selection));
    expect(weekKeyForInstant(rows[0].recordedAt, selection.timeZone)).toBe("2026-03-02");
    expect(weekKeyForInstant(rows[1].recordedAt, selection.timeZone)).toBe("2026-03-02");
  });

  test("returns a finite empty result", () => {
    const dto = aggregateTrainingAnalytics([], selection);
    expect(dto.summary.averagePaceSecondsPerMile).toBeNull();
    expect(dto.summary.totalDistanceMiles).toBe(0);
    expect(dto.weeks.every((week) => week.distanceMiles === 0)).toBe(true);
  });
});
