import type { ActivityRepository } from "./activity-repository";
import {
  seedActivities,
  type SeedActivityRecord,
} from "./fixtures/seed-activities";
import type { Activity, ActivityId } from "./types";

/** The single place a raw string becomes an ActivityId. */
export function toActivityId(raw: string): ActivityId {
  return raw as ActivityId;
}

function toActivity(
  record: SeedActivityRecord,
  viewerId: string | null,
): Activity {
  return {
    id: toActivityId(record.id),
    athlete: { id: record.athleteId, displayName: record.athleteName },
    title: record.title,
    sportType: record.sportType,
    startedAt: record.startedAt,
    distanceMeters: record.distanceMeters,
    movingTimeSeconds: record.movingTimeSeconds,
    elevationGainMeters: record.elevationGainMeters,
    averageHeartRateBpm: record.averageHeartRateBpm,
    kudosCount: record.kudosCount,
    viewerHasKudoed:
      viewerId !== null && record.kudoedByViewerIds.includes(viewerId),
    route: record.route,
  };
}

export function createSeededActivityRepository(): ActivityRepository {
  return {
    async listForViewer(viewerId) {
      return [...seedActivities]
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
        .map((record) => toActivity(record, viewerId));
    },
  };
}
