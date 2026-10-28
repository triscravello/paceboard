export interface AnalyticsActivity {
  readonly recordedAt: Date;
  readonly distanceHundredthsMiles: number;
  readonly elapsedSeconds: number;
  readonly elevationGainFeet: number;
}

export interface AnalyticsSelection {
  readonly weeks: 4 | 8 | 12;
  readonly endDate: string;
  readonly timeZone: string;
}

export interface AnalyticsWindow {
  readonly startDate: string;
  readonly endDate: string;
  readonly from: Date;
  readonly until: Date;
}

export interface WeeklyTrainingDto {
  readonly weekStart: string;
  readonly distanceMiles: number;
  readonly durationSeconds: number;
  readonly elevationGainFeet: number;
  readonly activityCount: number;
  readonly activeDays: number;
  readonly rollingAverageMiles: number | null;
  readonly changeMiles: number | null;
  readonly changePercent: number | null;
}

export interface TrainingAnalyticsDto {
  readonly policy: {
    readonly weekStartsOn: "Monday";
    readonly timeZone: string;
    readonly startDate: string;
    readonly endDate: string;
    readonly rounding: "miles:2, paceSeconds:nearest, rollingMiles:2, changePercent:1";
  };
  readonly summary: {
    readonly totalDistanceMiles: number;
    readonly totalDurationSeconds: number;
    readonly averagePaceSecondsPerMile: number | null;
    readonly totalElevationGainFeet: number;
    readonly activityCount: number;
    readonly averageRunsPerWeek: number;
  };
  readonly weeks: readonly WeeklyTrainingDto[];
}
