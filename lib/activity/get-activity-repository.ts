import type { ActivityRepository } from "./activity-repository";
import { createSeededActivityRepository } from "./seeded-activity-repository";

/** Server composition point. Swap the adapter here in later projects. */
export function getActivityRepository(): ActivityRepository {
  return createSeededActivityRepository();
}
