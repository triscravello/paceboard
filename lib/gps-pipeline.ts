import { XMLParser, XMLValidator } from "fast-xml-parser";

export const GPS_POLICY_V1 = {
  version: "gps-v1",
  maxFileBytes: 1_000_000,
  maxPoints: 20_000,
  earthRadiusMeters: 6_371_000,
  maxRunningSpeedMetersPerSecond: 12,
  coordinateDecimals: 6,
  elevationDecimals: 2,
} as const;
const METERS_PER_MILE = 1609.344;
export type WarningCode = "INVALID_COORDINATE" | "MISSING_ELEVATION" | "INVALID_ELEVATION" | "MISSING_TIMESTAMP" | "INVALID_TIMESTAMP" | "DUPLICATE_TIMESTAMP" | "OUT_OF_ORDER_TIMESTAMP" | "IMPOSSIBLE_JUMP";
export interface GpsWarning { readonly code: WarningCode; readonly sourceIndex: number }
export interface RawTrackPoint { readonly sourceIndex: number; readonly latitude: unknown; readonly longitude: unknown; readonly elevation: unknown; readonly timestamp: unknown }
export interface NormalizedCandidate { readonly sourceIndex: number; readonly latitude: number | null; readonly longitude: number | null; readonly elevationMeters: number | null; readonly elevationState: "valid" | "missing" | "invalid"; readonly timestampMs: number | null; readonly timestampState: "valid" | "missing" | "invalid" }
export interface AcceptedTrackPoint { readonly sourceIndex: number; readonly latitude: number; readonly longitude: number; readonly elevationMeters: number | null; readonly timestampMs: number | null }
export interface GpsMetrics { readonly routeDistanceMeters: number; readonly timedDistanceMeters: number; readonly elapsedSeconds: number; readonly averagePaceSecondsPerMile: number; readonly elevationGainMeters: number; readonly recordedAt: Date }
export type ParseResult = { readonly ok: true; readonly title: string; readonly rawPoints: readonly RawTrackPoint[] } | { readonly ok: false; readonly reason: "malformed_xml" | "unsupported_gpx" | "invalid_structure" };
export type ProcessResult = { readonly ok: true; readonly rawPoints: readonly RawTrackPoint[]; readonly candidates: readonly NormalizedCandidate[]; readonly acceptedPoints: readonly AcceptedTrackPoint[]; readonly warnings: readonly GpsWarning[]; readonly metrics: GpsMetrics } | { readonly ok: false; readonly reason: "insufficient_geometry" | "insufficient_timing"; readonly warnings: readonly GpsWarning[] };

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function asArray(value: unknown): unknown[] { return value === undefined ? [] : Array.isArray(value) ? value : [value]; }
function round(value: number, decimals: number): number { const factor = 10 ** decimals; return Math.round(value * factor) / factor; }
const ISO_WITH_ZONE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
function numeric(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseGpxTrack(xml: string): ParseResult {
  if (xml.includes("\0") || /<!DOCTYPE/i.test(xml)) return { ok: false, reason: "unsupported_gpx" };
  if (XMLValidator.validate(xml) !== true) return { ok: false, reason: "malformed_xml" };
  let document: unknown;
  try {
    document = new XMLParser({ ignoreAttributes: false, parseTagValue: false, parseAttributeValue: false, trimValues: true, processEntities: false, maxNestedTags: 32 }).parse(xml);
  } catch {
    return { ok: false, reason: "malformed_xml" };
  }
  if (!isRecord(document) || !isRecord(document.gpx)) return { ok: false, reason: "invalid_structure" };
  const root = document.gpx;
  if (root["@_xmlns"] !== "http://www.topografix.com/GPX/1/1" || root["@_version"] !== "1.1" || typeof root["@_creator"] !== "string" || root["@_creator"].trim() === "") return { ok: false, reason: "unsupported_gpx" };
  if (root.rte !== undefined || root.wpt !== undefined) return { ok: false, reason: "unsupported_gpx" };
  const tracks = asArray(root.trk);
  if (tracks.length !== 1 || !isRecord(tracks[0])) return { ok: false, reason: "invalid_structure" };
  const track = tracks[0];
  const segments = asArray(track.trkseg);
  if (segments.length !== 1 || !isRecord(segments[0])) return { ok: false, reason: "invalid_structure" };
  const pointNodes = asArray(segments[0].trkpt);
  if (pointNodes.length < 2 || pointNodes.length > GPS_POLICY_V1.maxPoints || pointNodes.some((point) => !isRecord(point))) return { ok: false, reason: "invalid_structure" };
  const rawPoints = pointNodes.map((point, sourceIndex) => {
    const value = point as Record<string, unknown>;
    return { sourceIndex, latitude: value["@_lat"], longitude: value["@_lon"], elevation: value.ele, timestamp: value.time } satisfies RawTrackPoint;
  });
  const title = typeof track.name === "string" && track.name.trim() ? track.name.trim() : "Imported GPX Run";
  return { ok: true, title, rawPoints };
}

export function normalizeTrackPoints(rawPoints: readonly RawTrackPoint[]): readonly NormalizedCandidate[] {
  return rawPoints.map((point) => {
    const latitude = numeric(point.latitude);
    const longitude = numeric(point.longitude);
    const elevation = numeric(point.elevation);
    const timestampText = typeof point.timestamp === "string" ? point.timestamp.trim() : "";
    const timestampMs = ISO_WITH_ZONE.test(timestampText) ? Date.parse(timestampText) : Number.NaN;
    return {
      sourceIndex: point.sourceIndex,
      latitude: latitude === null ? null : round(latitude, GPS_POLICY_V1.coordinateDecimals),
      longitude: longitude === null ? null : round(longitude, GPS_POLICY_V1.coordinateDecimals),
      elevationMeters: elevation === null ? null : round(elevation, GPS_POLICY_V1.elevationDecimals),
      elevationState: point.elevation === undefined || point.elevation === null || String(point.elevation).trim() === "" ? "missing" : elevation === null ? "invalid" : "valid",
      timestampMs: Number.isFinite(timestampMs) ? timestampMs : null,
      timestampState: point.timestamp === undefined || point.timestamp === null || timestampText === "" ? "missing" : Number.isFinite(timestampMs) ? "valid" : "invalid",
    } satisfies NormalizedCandidate;
  });
}

export function haversineMeters(a: Pick<AcceptedTrackPoint, "latitude" | "longitude">, b: Pick<AcceptedTrackPoint, "latitude" | "longitude">): number {
  const radians = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * radians;
  const dLon = (b.longitude - a.longitude) * radians;
  const lat1 = a.latitude * radians;
  const lat2 = b.latitude * radians;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * GPS_POLICY_V1.earthRadiusMeters * Math.asin(Math.sqrt(h));
}

export function validateTrackPoints(candidates: readonly NormalizedCandidate[]): { readonly acceptedPoints: readonly AcceptedTrackPoint[]; readonly warnings: readonly GpsWarning[] } {
  const acceptedPoints: AcceptedTrackPoint[] = [];
  const warnings: GpsWarning[] = [];
  let lastTimestampMs: number | null = null;
  for (const candidate of candidates) {
    if (candidate.latitude === null || candidate.longitude === null || candidate.latitude < -90 || candidate.latitude > 90 || candidate.longitude < -180 || candidate.longitude >= 180) {
      warnings.push({ code: "INVALID_COORDINATE", sourceIndex: candidate.sourceIndex });
      continue;
    }
    if (candidate.elevationState === "missing") warnings.push({ code: "MISSING_ELEVATION", sourceIndex: candidate.sourceIndex });
    if (candidate.elevationState === "invalid") warnings.push({ code: "INVALID_ELEVATION", sourceIndex: candidate.sourceIndex });
    if (candidate.timestampState === "missing") warnings.push({ code: "MISSING_TIMESTAMP", sourceIndex: candidate.sourceIndex });
    if (candidate.timestampState === "invalid") warnings.push({ code: "INVALID_TIMESTAMP", sourceIndex: candidate.sourceIndex });
    let timestampMs = candidate.timestampMs;
    if (timestampMs !== null && lastTimestampMs !== null && timestampMs <= lastTimestampMs) {
      warnings.push({ code: timestampMs === lastTimestampMs ? "DUPLICATE_TIMESTAMP" : "OUT_OF_ORDER_TIMESTAMP", sourceIndex: candidate.sourceIndex });
      timestampMs = null;
    }
    const point: AcceptedTrackPoint = { sourceIndex: candidate.sourceIndex, latitude: candidate.latitude, longitude: candidate.longitude, elevationMeters: candidate.elevationMeters, timestampMs };
    const previous = acceptedPoints.at(-1);
    if (previous && previous.timestampMs !== null && point.timestampMs !== null) {
      const elapsedSeconds = (point.timestampMs - previous.timestampMs) / 1000;
      if (elapsedSeconds > 0 && haversineMeters(previous, point) / elapsedSeconds > GPS_POLICY_V1.maxRunningSpeedMetersPerSecond) {
        warnings.push({ code: "IMPOSSIBLE_JUMP", sourceIndex: candidate.sourceIndex });
        continue;
      }
    }
    acceptedPoints.push(point);
    if (point.timestampMs !== null) lastTimestampMs = point.timestampMs;
  }
  return { acceptedPoints, warnings };
}

export function deriveGpsMetrics(points: readonly AcceptedTrackPoint[]): GpsMetrics | null {
  if (points.length < 2) return null;
  let routeDistanceMeters = 0;
  let timedDistanceMeters = 0;
  let elapsedMilliseconds = 0;
  let elevationGainMeters = 0;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const distance = haversineMeters(previous, current);
    routeDistanceMeters += distance;
    if (previous.timestampMs !== null && current.timestampMs !== null && current.timestampMs > previous.timestampMs) {
      timedDistanceMeters += distance;
      elapsedMilliseconds += current.timestampMs - previous.timestampMs;
    }
    if (previous.elevationMeters !== null && current.elevationMeters !== null) elevationGainMeters += Math.max(0, current.elevationMeters - previous.elevationMeters);
  }
  const recordedTimestamp = points.find((point) => point.timestampMs !== null)?.timestampMs ?? null;
  if (recordedTimestamp === null || timedDistanceMeters <= 0 || elapsedMilliseconds <= 0) return null;
  const elapsedSeconds = Math.round(elapsedMilliseconds / 1000);
  return {
    routeDistanceMeters: round(routeDistanceMeters, 2),
    timedDistanceMeters: round(timedDistanceMeters, 2),
    elapsedSeconds,
    averagePaceSecondsPerMile: Math.round(elapsedSeconds / (timedDistanceMeters / METERS_PER_MILE)),
    elevationGainMeters: round(elevationGainMeters, 2),
    recordedAt: new Date(recordedTimestamp),
  };
}

export function processTrack(rawPoints: readonly RawTrackPoint[]): ProcessResult {
  const candidates = normalizeTrackPoints(rawPoints);
  const { acceptedPoints, warnings } = validateTrackPoints(candidates);
  if (acceptedPoints.length < 2) return { ok: false, reason: "insufficient_geometry", warnings };
  const metrics = deriveGpsMetrics(acceptedPoints);
  return metrics ? { ok: true, rawPoints, candidates, acceptedPoints, warnings, metrics } : { ok: false, reason: "insufficient_timing", warnings };
}

export function deriveNaiveMetrics(rawPoints: readonly RawTrackPoint[]) {
  const points = rawPoints.map((point) => ({ latitude: Number(point.latitude), longitude: Number(point.longitude), elevationMeters: Number(point.elevation), timestampMs: Date.parse(String(point.timestamp)) })).filter((point) => Number.isFinite(point.latitude) && Number.isFinite(point.longitude));
  let distanceMeters = 0;
  let elevationGainMeters = 0;
  for (let index = 1; index < points.length; index += 1) {
    distanceMeters += haversineMeters(points[index - 1], points[index]);
    if (Number.isFinite(points[index - 1].elevationMeters) && Number.isFinite(points[index].elevationMeters)) elevationGainMeters += Math.max(0, points[index].elevationMeters - points[index - 1].elevationMeters);
  }
  const elapsedSeconds = Math.max(0, Math.round((points.at(-1)!.timestampMs - points[0].timestampMs) / 1000));
  return { distanceMeters: round(distanceMeters, 2), elapsedSeconds, elevationGainMeters: round(elevationGainMeters, 2), averagePaceSecondsPerMile: distanceMeters > 0 ? Math.round(elapsedSeconds / (distanceMeters / METERS_PER_MILE)) : 0 };
}