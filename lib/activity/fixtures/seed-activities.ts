export interface SeedActivityRecord {
  readonly id: string;
  readonly athleteId: string;
  readonly athleteName: string;
  readonly title: string;
  readonly sportType: "run" | "ride" | "walk";
  readonly startedAt: string;
  readonly distanceMeters: number;
  readonly movingTimeSeconds: number;
  readonly elevationGainMeters: number;
  readonly averageHeartRateBpm: number | null;
  readonly kudosCount: number;
  readonly kudoedByViewerIds: ReadonlyArray<string>;
  readonly route: ReadonlyArray<readonly [number, number]> | null;
}

export const SEED_VIEWER_ID = "viewer-demo";

export const seedActivities: ReadonlyArray<SeedActivityRecord> = [
  {
    id: "act_006",
    athleteId: "ath_maya",
    athleteName: "Maya Okafor",
    title: "Sunrise tempo along the river",
    sportType: "run",
    startedAt: "2026-10-25T11:05:00Z",
    distanceMeters: 8046.72,
    movingTimeSeconds: 2310,
    elevationGainMeters: 42,
    averageHeartRateBpm: 163,
    kudosCount: 14,
    kudoedByViewerIds: [SEED_VIEWER_ID],
    route: [
      [40.7061, -74.0087],
      [40.7112, -74.0121],
      [40.7189, -74.0156],
      [40.7245, -74.0102],
      [40.7198, -74.0049],
    ],
  },
  {
    id: "act_005",
    athleteId: "ath_dev",
    athleteName: "Dev Patel",
    title: "Hill repeats",
    sportType: "run",
    startedAt: "2026-10-24T22:30:00Z",
    distanceMeters: 6437.38,
    movingTimeSeconds: 2205,
    elevationGainMeters: 188,
    averageHeartRateBpm: 171,
    kudosCount: 9,
    kudoedByViewerIds: [],
    route: [
      [37.7694, -122.4862],
      [37.7721, -122.4793],
      [37.7762, -122.4731],
    ],
  },
  {
    id: "act_004",
    athleteId: "ath_lena",
    athleteName: "Lena Fischer",
    title: "Saturday long ride",
    sportType: "ride",
    startedAt: "2026-10-24T14:00:00Z",
    distanceMeters: 62400,
    movingTimeSeconds: 8940,
    elevationGainMeters: 610,
    averageHeartRateBpm: null,
    kudosCount: 23,
    kudoedByViewerIds: [SEED_VIEWER_ID],
    route: null,
  },
  {
    id: "act_003",
    athleteId: "ath_maya",
    athleteName: "Maya Okafor",
    title: "Recovery jog",
    sportType: "run",
    startedAt: "2026-10-23T12:15:00Z",
    distanceMeters: 4828.03,
    movingTimeSeconds: 1790,
    elevationGainMeters: 18,
    averageHeartRateBpm: 138,
    kudosCount: 5,
    kudoedByViewerIds: [],
    route: null,
  },
  {
    id: "act_002",
    athleteId: "ath_sam",
    athleteName: "Sam Rivera",
    title: "Lunch walk with the dog",
    sportType: "walk",
    startedAt: "2026-10-22T17:40:00Z",
    distanceMeters: 2400,
    movingTimeSeconds: 1980,
    elevationGainMeters: 9,
    averageHeartRateBpm: 104,
    kudosCount: 0,
    kudoedByViewerIds: [],
    route: null,
  },
  {
    id: "act_001",
    athleteId: "ath_dev",
    athleteName: "Dev Patel",
    title: "First 10K of the season",
    sportType: "run",
    startedAt: "2026-10-20T13:00:00Z",
    distanceMeters: 10000,
    movingTimeSeconds: 3540,
    elevationGainMeters: 74,
    averageHeartRateBpm: 158,
    kudosCount: 31,
    kudoedByViewerIds: [],
    route: null,
  },
];
