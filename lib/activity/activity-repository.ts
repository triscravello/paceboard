import type { Activity } from "./types";

export interface ActivityRepository {
  /**
   * Lists activities for a viewer, newest first.
   *
   * - `viewerId` is `null` for an anonymous viewer.
   * - `ActivityId` values must be stable and unique across calls.
   * - `viewerHasKudoed` is relative to `viewerId`.
   */
  listForViewer(viewerId: string | null): Promise<ReadonlyArray<Activity>>;
}
