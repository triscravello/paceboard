import { expect, test } from "vitest";
import { aggregateTrainingAnalytics } from "@/lib/training-analytics";
import type { AnalyticsActivity, AnalyticsSelection } from "@/types/training-analytics";

const selection: AnalyticsSelection = { weeks: 4, endDate: "2026-03-15", timeZone: "America/New_York" };
const rows: readonly AnalyticsActivity[] = [
  { recordedAt: new Date("2026-03-08T06:30:00Z"), distanceHundredthsMiles: 300, elapsedSeconds: 1800, elevationGainFeet: 0 },
  { recordedAt: new Date("2026-03-08T07:30:00Z"), distanceHundredthsMiles: 400, elapsedSeconds: 2100, elevationGainFeet: 0 },
  { recordedAt: new Date("2026-03-09T03:30:00Z"), distanceHundredthsMiles: 500, elapsedSeconds: 2500, elevationGainFeet: 0 },
];

function naiveUtcMonday(date: Date): string {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const daysFromMonday = (utc.getUTCDay() + 6) % 7;
  utc.setUTCDate(utc.getUTCDate() - daysFromMonday);
  return utc.toISOString().slice(0, 10);
}

test("repairs UTC-week boundary grouping without losing or duplicating distance", () => {
  const naive = new Map<string, number>();
  for (const row of rows) naive.set(naiveUtcMonday(row.recordedAt), (naive.get(naiveUtcMonday(row.recordedAt)) ?? 0) + row.distanceHundredthsMiles / 100);
  const corrected = aggregateTrainingAnalytics(rows, selection);
  const localWeek = corrected.weeks.find((week) => week.weekStart === "2026-03-02");
  expect(Object.fromEntries(naive)).toEqual({ "2026-03-02": 7, "2026-03-09": 5 });
  expect(localWeek?.distanceMiles).toBe(12);
  expect(corrected.summary.totalDistanceMiles).toBe(12);
  expect(corrected.weeks.reduce((sum, week) => sum + week.distanceMiles, 0)).toBe(12);
  expect(corrected.weeks.reduce((sum, week) => sum + week.activityCount, 0)).toBe(3);
  expect(corrected).toEqual(aggregateTrainingAnalytics(rows, selection));
  expect(JSON.stringify(corrected)).not.toMatch(/points|gpsRoute|latitude|longitude|ownerId/);
});