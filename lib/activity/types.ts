declare const activityIdBrand: unique symbol;

/** Opaque identifier. Only the repository adapter may mint one. */
export type ActivityId = string & { readonly [activityIdBrand]: true };

/** [latitude, longitude]. Plain nested arrays survive the RSC boundary. */
export type RoutePoint = readonly [latitude: number, longitude: number];

export interface Athlete {
  readonly id: string;
  readonly displayName: string;
}

export type SportType = "run" | "ride" | "walk";

export interface Activity {
  readonly id: ActivityId;
  readonly athlete: Athlete;
  readonly title: string;
  readonly sportType: SportType;
  /** ISO-8601 UTC timestamp. */
  readonly startedAt: string;
  readonly distanceMeters: number;
  readonly movingTimeSeconds: number;
  readonly elevationGainMeters: number;
  /** null when the activity has no heart rate data. */
  readonly averageHeartRateBpm: number | null;
  /** Total kudos from source data, including the viewer's own. */
  readonly kudosCount: number;
  /** Initial viewer-relative state; always false for an anonymous viewer. */
  readonly viewerHasKudoed: boolean;
  readonly route: ReadonlyArray<RoutePoint> | null;
}
