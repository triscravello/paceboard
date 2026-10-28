import { analyticsRepository } from "@/data/analytics-repository";
import { aggregateTrainingAnalytics, analyticsWindow } from "@/lib/training-analytics";
import type { AnalyticsSelection, TrainingAnalyticsDto } from "@/types/training-analytics";
export type TrainingAnalyticsResult = { readonly ok: true; readonly dto: TrainingAnalyticsDto } | { readonly ok: false; readonly error: "unauthorized"; readonly status: 401 };
export async function getTrainingAnalytics(viewerId: string | null, selection: AnalyticsSelection): Promise<TrainingAnalyticsResult> {
  if (viewerId === null) return { ok: false, error: "unauthorized", status: 401 };
  const window = analyticsWindow(selection), runs = await analyticsRepository.listOwnedRuns(viewerId, window.from, window.until);
  return { ok: true, dto: aggregateTrainingAnalytics(runs, selection, window) };
}
