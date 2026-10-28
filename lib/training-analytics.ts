import { Temporal } from "@js-temporal/polyfill";
import { z } from "zod";
import type { AnalyticsActivity, AnalyticsSelection, AnalyticsWindow, TrainingAnalyticsDto, WeeklyTrainingDto } from "@/types/training-analytics";
const isDate = (v: string) => { try { return Temporal.PlainDate.from(v, { overflow: "reject" }).toString() === v; } catch { return false; } };
const isIanaZone = (v: string) => { if (!/^[A-Za-z_]+(?:[/+-][A-Za-z0-9_+-]+)*$/.test(v)) return false; try { new Intl.DateTimeFormat("en-US", { timeZone: v }); return true; } catch { return false; } };
const selectionSchema = z.object({
  weeks: z.enum(["4", "8", "12"]).transform((v) => Number(v) as 4 | 8 | 12),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(isDate),
  timeZone: z.string().max(64).refine(isIanaZone),
});
export function parseAnalyticsSelection(params: URLSearchParams): AnalyticsSelection | null {
  const parsed = selectionSchema.safeParse({ weeks: params.get("weeks"), endDate: params.get("endDate"), timeZone: params.get("timeZone") });
  return parsed.success ? parsed.data : null;
}
const mondayOf = (d: Temporal.PlainDate) => d.subtract({ days: d.dayOfWeek - 1 });
const round = (v: number, places: number) => Math.round(v * 10 ** places) / 10 ** places;
export function analyticsWindow(selection: AnalyticsSelection): AnalyticsWindow {
  const end = Temporal.PlainDate.from(selection.endDate), start = mondayOf(end).subtract({ weeks: selection.weeks - 1 });
  const instant = (d: Temporal.PlainDate) => new Date(d.toZonedDateTime(selection.timeZone).startOfDay().epochMilliseconds);
  return { startDate: start.toString(), endDate: end.toString(), from: instant(start), until: instant(end.add({ days: 1 })) };
}
const localDate = (instant: Date, timeZone: string) => Temporal.Instant.fromEpochMilliseconds(instant.getTime()).toZonedDateTimeISO(timeZone).toPlainDate();
export function weekKeyForInstant(instant: Date, timeZone: string): string { return mondayOf(localDate(instant, timeZone)).toString(); }
interface Bucket { distance: number; seconds: number; elevation: number; count: number; days: Set<string> }
export function aggregateTrainingAnalytics(runs: readonly AnalyticsActivity[], selection: AnalyticsSelection, window: AnalyticsWindow = analyticsWindow(selection)): TrainingAnalyticsDto {
  const buckets = new Map<string, Bucket>();
  for (let w = 0; w < selection.weeks; w++) buckets.set(Temporal.PlainDate.from(window.startDate).add({ weeks: w }).toString(), { distance: 0, seconds: 0, elevation: 0, count: 0, days: new Set() });
  let paceSeconds = 0, paceDistance = 0;
  for (const run of runs) {
    const bucket = buckets.get(weekKeyForInstant(run.recordedAt, selection.timeZone));
    if (!bucket) continue;
    bucket.distance += run.distanceHundredthsMiles; bucket.seconds += run.elapsedSeconds; bucket.elevation += run.elevationGainFeet; bucket.count += 1; bucket.days.add(localDate(run.recordedAt, selection.timeZone).toString());
    if (run.distanceHundredthsMiles > 0) { paceSeconds += run.elapsedSeconds; paceDistance += run.distanceHundredthsMiles; }
  }
  const entries = [...buckets.entries()];
  const weeks: WeeklyTrainingDto[] = entries.map(([weekStart, b], i) => {
    const prev = i > 0 ? entries[i - 1][1].distance : null;
    return {
      weekStart, distanceMiles: round(b.distance / 100, 2), durationSeconds: b.seconds, elevationGainFeet: b.elevation, activityCount: b.count, activeDays: b.days.size,
      rollingAverageMiles: i >= 3 ? round(entries.slice(i - 3, i + 1).reduce((sum, [, e]) => sum + e.distance, 0) / 4 / 100, 2) : null,
      changeMiles: prev === null ? null : round((b.distance - prev) / 100, 2),
      changePercent: prev === null || prev === 0 ? null : round(((b.distance - prev) / prev) * 100, 1),
    };
  });
  const totals = entries.reduce((t, [, b]) => ({ distance: t.distance + b.distance, seconds: t.seconds + b.seconds, elevation: t.elevation + b.elevation, count: t.count + b.count }), { distance: 0, seconds: 0, elevation: 0, count: 0 });
  return {
    policy: { weekStartsOn: "Monday", timeZone: selection.timeZone, startDate: window.startDate, endDate: window.endDate, rounding: "miles:2, paceSeconds:nearest, rollingMiles:2, changePercent:1" },
    summary: { totalDistanceMiles: round(totals.distance / 100, 2), totalDurationSeconds: totals.seconds, averagePaceSecondsPerMile: paceDistance === 0 ? null : Math.round((paceSeconds * 100) / paceDistance), totalElevationGainFeet: totals.elevation, activityCount: totals.count, averageRunsPerWeek: round(totals.count / selection.weeks, 2) },
    weeks,
  };
}
