declare const activityIdBrand: unique symbol;
export type ActivityId = string & { readonly [activityIdBrand]: "ActivityId" };
export function activityId(value: string): ActivityId { if (!value.trim()) throw new Error("Activity ID cannot be empty"); return value as ActivityId; }
export type ActivitySport = "Run" | "Ride" | "Walk";
export interface AthleteSummary { readonly id: string; readonly name: string; readonly initials: string }
export interface ActivityMetrics { readonly distanceMiles: number; readonly elapsedSeconds: number; readonly averagePaceSecondsPerMile: number; readonly elevationGainFeet: number }
export interface RoutePoint { readonly x: number; readonly y: number }
export interface RouteGeometry { readonly path: string; readonly start: RoutePoint; readonly finish: RoutePoint; readonly gpsActivityId?: ActivityId | null }
export interface Activity { readonly id: ActivityId; readonly athlete: AthleteSummary; readonly sport: ActivitySport; readonly title: string; readonly recordedAtLabel: string; readonly recordedAtIso: string; readonly note: string; readonly metrics: ActivityMetrics; readonly route: RouteGeometry; readonly initialKudos: number; readonly viewerHasKudos: boolean; readonly ownedByViewer: boolean }
